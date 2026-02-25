import { Router, type Request, type Response } from 'express';
import { prisma } from '../db';

type WeeklyOverviewQuery = {
  userId?: string;
  weekStart?: string;
};

const router: Router = Router();

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getWeekStart(date: Date): Date {
  const normalized = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = normalized.getUTCDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  normalized.setUTCDate(normalized.getUTCDate() + mondayOffset);
  return normalized;
}

function parseWeekStart(value?: string): Date | null {
  if (!value) {
    return getWeekStart(new Date());
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return getWeekStart(parsed);
}

router.get('/weekly', async (req: Request<Record<string, never>, unknown, unknown, WeeklyOverviewQuery>, res: Response) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      res.status(400).json({ error: 'userId is required' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const weekStartDate = parseWeekStart(req.query.weekStart);

    if (!weekStartDate) {
      res.status(400).json({ error: 'weekStart must be in YYYY-MM-DD format' });
      return;
    }

    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setUTCDate(weekEndDate.getUTCDate() + 6);

    const weekStart = formatDate(weekStartDate);
    const weekEnd = formatDate(weekEndDate);

    const tasks = await prisma.task.findMany({
      where: {
        assigneeId: userId,
        deadline: {
          not: null,
          gte: weekStart,
          lte: weekEnd,
        },
      },
      include: {
        column: {
          select: {
            id: true,
            title: true,
            board: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
      orderBy: {
        deadline: 'asc',
      },
    });

    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const days = weekdays.map((weekday, index) => {
      const date = new Date(weekStartDate);
      date.setUTCDate(date.getUTCDate() + index);
      const isoDate = formatDate(date);

      const dayTasks = tasks.filter((task) => task.deadline === isoDate);

      return {
        weekday,
        date: isoDate,
        tasks: dayTasks.map((task) => ({
          id: task.id,
          title: task.title,
          status: task.status,
          deadline: task.deadline,
          boardId: task.column.board.id,
          boardTitle: task.column.board.title,
          columnId: task.column.id,
          columnTitle: task.column.title,
        })),
      };
    });

    res.json({
      user,
      weekStart,
      weekEnd,
      days,
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch weekly overview' });
  }
});

export default router;
