import { Router, type Request, type Response } from 'express';
import { prisma } from '../db';

type CreateTaskParams = {
  columnId: string;
};

type TaskParams = {
  taskId: string;
};

type CreateTaskBody = {
  title?: string;
  owner?: string;
  assigneeId?: string | null;
  status?: string;
  deadline?: string | null;
};

type UpdateTaskBody = Partial<CreateTaskBody> & {
  id?: never;
};

const router: Router = Router();

async function resolveAssignee(assigneeId: string) {
  return prisma.user.findUnique({
    where: { id: assigneeId },
    select: { id: true, name: true },
  });
}

// POST new task in a column
router.post('/columns/:columnId/tasks', async (req: Request<CreateTaskParams, unknown, CreateTaskBody>, res: Response) => {
  try {
    const { columnId } = req.params;
    const { title, owner, assigneeId, status, deadline } = req.body;

    const column = await prisma.column.findUnique({ where: { id: columnId } });
    if (!column) {
      res.status(404).json({ error: 'Column not found' });
      return;
    }

    let resolvedAssigneeId: string | null = null;
    let resolvedOwner = owner?.trim();

    if (assigneeId) {
      const assignee = await resolveAssignee(assigneeId);
      if (!assignee) {
        res.status(404).json({ error: 'Assignee not found' });
        return;
      }
      resolvedAssigneeId = assignee.id;
      if (!resolvedOwner) {
        resolvedOwner = assignee.name;
      }
    }

    if (!resolvedOwner) {
      resolvedOwner = 'Unassigned';
    }

    const maxOrderTask = await prisma.task.findFirst({
      where: { columnId },
      orderBy: { order: 'desc' },
    });
    const order = maxOrderTask ? maxOrderTask.order + 1 : 0;

    const task = await prisma.task.create({
      data: {
        title: title?.trim() ?? '',
        owner: resolvedOwner,
        assigneeId: resolvedAssigneeId,
        status: status || 'Not Started',
        deadline: deadline || null,
        columnId,
        order,
      },
    });

    res.json(task);
  } catch {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// PUT update a task (status, title, deadline, assignee, etc)
router.put('/tasks/:taskId', async (req: Request<TaskParams, unknown, UpdateTaskBody>, res: Response) => {
  try {
    const { taskId } = req.params;
    const updates = req.body;

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    const data: {
      title?: string;
      owner?: string;
      assigneeId?: string | null;
      status?: string;
      deadline?: string | null;
    } = {};

    if (typeof updates.title === 'string') {
      data.title = updates.title;
    }

    if (typeof updates.status === 'string') {
      data.status = updates.status;
    }

    if (updates.deadline !== undefined) {
      data.deadline = updates.deadline || null;
    }

    if (updates.assigneeId !== undefined) {
      if (!updates.assigneeId) {
        data.assigneeId = null;
        if (updates.owner === undefined) {
          data.owner = 'Unassigned';
        }
      } else {
        const assignee = await resolveAssignee(updates.assigneeId);
        if (!assignee) {
          res.status(404).json({ error: 'Assignee not found' });
          return;
        }

        data.assigneeId = assignee.id;
        if (updates.owner === undefined) {
          data.owner = assignee.name;
        }
      }
    }

    if (updates.owner !== undefined) {
      data.owner = updates.owner.trim() || 'Unassigned';
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data,
    });

    res.json(updatedTask);
  } catch {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// DELETE a task
router.delete('/tasks/:taskId', async (req: Request<TaskParams>, res: Response) => {
  try {
    const { taskId } = req.params;

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    await prisma.task.delete({
      where: { id: taskId },
    });

    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

export default router;
