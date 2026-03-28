import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// POST /api/debts/:id/pay
router.post('/:id/pay', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const debt = await prisma.debt.update({
      where: { id: req.params.id },
      data: { status: 'paid' }
    });
    res.json(debt);
  } catch (err) { next(err); }
});

// POST /api/debts/:id/confirm
router.post('/:id/confirm', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const debt = await prisma.debt.update({
      where: { id: req.params.id },
      data: { status: 'confirmed' }
    });

    const pendingDebts = await prisma.debt.count({
      where: { event_id: debt.event_id, status: { not: 'confirmed' } }
    });

    if (pendingDebts === 0) {
      await prisma.event.update({
        where: { id: debt.event_id },
        data: { status: 'closed' }
      });
    }

    res.json(debt);
  } catch (err) { next(err); }
});

export default router;
