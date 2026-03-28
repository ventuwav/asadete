import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';

const router = Router();

const ToggleSchema = z.object({
  participant_id: z.string().min(1, 'participant_id is required')
});

// POST /api/items/:id/toggle
router.post('/:id/toggle', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { participant_id } = ToggleSchema.parse(req.body);

    const item = await prisma.expenseItem.findUnique({
      where: { id: req.params.id },
      include: { consumers: true }
    });
    if (!item) return res.status(404).json({ error: 'Item not found' });

    const isConsuming = item.consumers.some(c => c.id === participant_id);

    await prisma.expenseItem.update({
      where: { id: item.id },
      data: {
        consumers: isConsuming
          ? { disconnect: { id: participant_id } }
          : { connect: { id: participant_id } }
      }
    });

    res.json({ success: true, isConsuming: !isConsuming });
  } catch (err) { next(err); }
});

export default router;
