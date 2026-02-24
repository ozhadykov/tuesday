import { Router, Request, Response } from 'express';
import { prisma } from '../db';

const router = Router();

// POST new task in a column
router.post('/columns/:columnId/tasks', async (req: Request, res: Response) => {
  try {
    const { columnId } = req.params;
    const { title, owner, status, deadline } = req.body;
    
    // Find highest order to place task at bottom
    const maxOrderTask = await prisma.task.findFirst({
      where: { columnId },
      orderBy: { order: 'desc' }
    });
    const order = maxOrderTask ? maxOrderTask.order + 1 : 0;

    const task = await prisma.task.create({
      data: { 
        title: title || '', 
        owner: owner || 'Unassigned', 
        status: status || 'Not Started', 
        deadline: deadline || null,
        columnId, 
        order 
      }
    });
    
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// PUT update a task (status, title, deadline, etc)
router.put('/tasks/:taskId', async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const updates = req.body;
    
    // Disallow updating the ID directly
    delete updates.id;

    const task = await prisma.task.update({
      where: { id: taskId },
      data: updates
    });
    
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// DELETE a task
router.delete('/tasks/:taskId', async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    await prisma.task.delete({
      where: { id: taskId }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

export default router;
