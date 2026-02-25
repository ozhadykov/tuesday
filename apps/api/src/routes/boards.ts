import { Router, type Request, type Response } from 'express';
import { prisma } from '../db';

type BoardsQuery = {
  userId?: string;
};

type CreateBoardBody = {
  title?: string;
  teamId?: string | null;
};

type BoardParams = {
  boardId: string;
};

type CreateColumnBody = {
  title?: string;
  color?: string;
};

const router: Router = Router();

async function getUserAccess(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      memberships: {
        select: {
          teamId: true,
        },
      },
    },
  });
}

// GET all boards, optionally filtered by user visibility
router.get('/', async (req: Request<Record<string, never>, unknown, unknown, BoardsQuery>, res: Response) => {
  try {
    const userId = req.query.userId;

    if (!userId) {
      const boards = await prisma.board.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          team: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      res.json(boards);
      return;
    }

    const user = await getUserAccess(userId);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (user.role === 'ADMIN') {
      const boards = await prisma.board.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          team: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      res.json(boards);
      return;
    }

    const teamIds = user.memberships.map((membership) => membership.teamId);

    const boards = await prisma.board.findMany({
      where: {
        OR: [
          { teamId: null },
          {
            teamId: {
              in: teamIds.length > 0 ? teamIds : [''],
            },
          },
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.json(boards);
  } catch {
    res.status(500).json({ error: 'Failed to fetch boards' });
  }
});

// POST new board
router.post('/', async (req: Request<Record<string, never>, unknown, CreateBoardBody>, res: Response) => {
  try {
    const { title, teamId } = req.body;

    if (!title || !title.trim()) {
      res.status(400).json({ error: 'Board title is required' });
      return;
    }

    if (teamId) {
      const team = await prisma.team.findUnique({ where: { id: teamId } });
      if (!team) {
        res.status(404).json({ error: 'Team not found' });
        return;
      }
    }

    const board = await prisma.board.create({
      data: {
        title: title.trim(),
        ...(teamId ? { teamId } : {}),
      },
      include: {
        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.json(board);
  } catch {
    res.status(500).json({ error: 'Failed to create board' });
  }
});

// GET single board with its columns and tasks
router.get('/:boardId', async (req: Request<BoardParams, unknown, unknown, BoardsQuery>, res: Response): Promise<void> => {
  try {
    const { boardId } = req.params;
    const userId = req.query.userId;

    const board = await prisma.board.findUnique({
      where: { id: boardId },
      include: {
        team: {
          select: {
            id: true,
            name: true,
          },
        },
        columns: {
          orderBy: { order: 'asc' },
          include: {
            tasks: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    if (!board) {
      res.status(404).json({ error: 'Board not found' });
      return;
    }

    if (userId) {
      const user = await getUserAccess(userId);

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      if (user.role !== 'ADMIN' && board.teamId) {
        const canAccess = user.memberships.some((membership) => membership.teamId === board.teamId);

        if (!canAccess) {
          res.status(403).json({ error: 'You do not have access to this board' });
          return;
        }
      }
    }

    res.json(board);
  } catch {
    res.status(500).json({ error: 'Failed to fetch board details' });
  }
});

// POST new column (task group) inside a board
router.post('/:boardId/columns', async (req: Request<BoardParams, unknown, CreateColumnBody>, res: Response) => {
  try {
    const { boardId } = req.params;
    const { title, color } = req.body;

    if (!title || !title.trim()) {
      res.status(400).json({ error: 'Column title is required' });
      return;
    }

    const board = await prisma.board.findUnique({ where: { id: boardId } });
    if (!board) {
      res.status(404).json({ error: 'Board not found' });
      return;
    }

    const maxOrderCol = await prisma.column.findFirst({
      where: { boardId },
      orderBy: { order: 'desc' },
    });
    const order = maxOrderCol ? maxOrderCol.order + 1 : 0;

    const column = await prisma.column.create({
      data: {
        title: title.trim(),
        color: color || '#579bfc',
        boardId,
        order,
      },
    });

    res.json({ ...column, tasks: [] });
  } catch {
    res.status(500).json({ error: 'Failed to create column' });
  }
});

export default router;
