import { Router, type Request, type Response } from 'express';
import { prisma } from '../db';

const router: Router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { name: 'asc' },
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
    });

    res.json(users);
  } catch {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

export default router;
