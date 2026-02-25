import { Router, type Request, type Response } from 'express';
import { prisma } from '../db';

const router: Router = Router();

const USER_ROLES = new Set(['ADMIN', 'MEMBER']);
const TEAM_ROLES = new Set(['LEAD', 'MEMBER']);

type CreateUserBody = {
  name?: string;
  email?: string;
  role?: 'ADMIN' | 'MEMBER';
};

type UpdateUserRoleParams = {
  userId: string;
};

type UpdateUserRoleBody = {
  role?: 'ADMIN' | 'MEMBER';
};

type CreateTeamBody = {
  name?: string;
};

type CreateMembershipBody = {
  userId?: string;
  teamId?: string;
  role?: 'LEAD' | 'MEMBER';
};

type BoardParams = {
  boardId: string;
};

type BoardTeamBody = {
  teamId?: string | null;
};

router.get('/overview', async (_req: Request, res: Response) => {
  try {
    const [users, teams, boards] = await Promise.all([
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          memberships: {
            include: {
              team: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      }),
      prisma.team.findMany({
        orderBy: { name: 'asc' },
        include: {
          memberships: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true,
                },
              },
            },
          },
        },
      }),
      prisma.board.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          team: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
    ]);

    res.json({ users, teams, boards });
  } catch {
    res.status(500).json({ error: 'Failed to load admin overview' });
  }
});

router.post('/users', async (req: Request<Record<string, never>, unknown, CreateUserBody>, res: Response) => {
  try {
    const name = req.body.name?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const role = req.body.role ?? 'MEMBER';

    if (!name || !email) {
      res.status(400).json({ error: 'Name and email are required' });
      return;
    }

    if (!USER_ROLES.has(role)) {
      res.status(400).json({ error: 'Invalid user role' });
      return;
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        role,
      },
    });

    res.status(201).json(user);
  } catch {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

router.put('/users/:userId/role', async (req: Request<UpdateUserRoleParams, unknown, UpdateUserRoleBody>, res: Response) => {
  try {
    const { userId } = req.params;
    const role = req.body.role;

    if (!role || !USER_ROLES.has(role)) {
      res.status(400).json({ error: 'Valid role is required' });
      return;
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    res.json(user);
  } catch {
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

router.post('/teams', async (req: Request<Record<string, never>, unknown, CreateTeamBody>, res: Response) => {
  try {
    const name = req.body.name?.trim();

    if (!name) {
      res.status(400).json({ error: 'Team name is required' });
      return;
    }

    const team = await prisma.team.create({
      data: {
        name,
      },
    });

    res.status(201).json(team);
  } catch {
    res.status(500).json({ error: 'Failed to create team' });
  }
});

router.post('/memberships', async (req: Request<Record<string, never>, unknown, CreateMembershipBody>, res: Response) => {
  try {
    const { userId, teamId } = req.body;
    const role = req.body.role ?? 'MEMBER';

    if (!userId || !teamId) {
      res.status(400).json({ error: 'userId and teamId are required' });
      return;
    }

    if (!TEAM_ROLES.has(role)) {
      res.status(400).json({ error: 'Invalid team role' });
      return;
    }

    const [user, team] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.team.findUnique({ where: { id: teamId } }),
    ]);

    if (!user || !team) {
      res.status(404).json({ error: 'User or team not found' });
      return;
    }

    const membership = await prisma.teamMembership.upsert({
      where: {
        userId_teamId: {
          userId,
          teamId,
        },
      },
      update: {
        role,
      },
      create: {
        userId,
        teamId,
        role,
      },
      include: {
        team: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    res.status(201).json(membership);
  } catch {
    res.status(500).json({ error: 'Failed to save membership' });
  }
});

router.put('/boards/:boardId/team', async (req: Request<BoardParams, unknown, BoardTeamBody>, res: Response) => {
  try {
    const { boardId } = req.params;
    const { teamId } = req.body;

    const board = await prisma.board.findUnique({ where: { id: boardId } });

    if (!board) {
      res.status(404).json({ error: 'Board not found' });
      return;
    }

    if (teamId) {
      const team = await prisma.team.findUnique({ where: { id: teamId } });
      if (!team) {
        res.status(404).json({ error: 'Team not found' });
        return;
      }
    }

    const updatedBoard = await prisma.board.update({
      where: { id: boardId },
      data: {
        teamId: teamId ?? null,
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

    res.json(updatedBoard);
  } catch {
    res.status(500).json({ error: 'Failed to update board visibility' });
  }
});

export default router;
