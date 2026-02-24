import { Router, Request, Response } from 'express';
import { prisma } from '../db';

const router = Router();

// GET all boards
router.get('/', async (req: Request, res: Response) => {
  try {
    const boards = await prisma.board.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(boards);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch boards' });
  }
});

// POST new board
router.post('/', async (req: Request, res: Response) => {
  try {
    const { title } = req.body;
    const board = await prisma.board.create({
      data: { title }
    });
    res.json(board);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create board' });
  }
});

// GET single board with its columns and tasks
router.get('/:boardId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { boardId } = req.params;
    const board = await prisma.board.findUnique({
      where: { id: boardId },
      include: {
        columns: {
          orderBy: { order: 'asc' },
          include: {
            tasks: {
              orderBy: { order: 'asc' }
            }
          }
        }
      }
    });

    if (!board) {
      res.status(404).json({ error: 'Board not found' });
      return;
    }
    res.json(board);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch board details' });
  }
});

// POST new column (task group) inside a board
router.post('/:boardId/columns', async (req: Request, res: Response) => {
  try {
    const { boardId } = req.params;
    const { title, color } = req.body;

    // Determine the next order for the new column
    const maxOrderCol = await prisma.column.findFirst({
      where: { boardId },
      orderBy: { order: 'desc' }
    });
    const order = maxOrderCol ? maxOrderCol.order + 1 : 0;

    const column = await prisma.column.create({
      data: {
        title,
        color: color || '#zinc-500',
        boardId,
        order
      }
    });
    
    // Return with empty tasks array for UI consistency
    res.json({ ...column, tasks: [] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create column' });
  }
});

export default router;
