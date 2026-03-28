import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../lib/prisma';
import { settleEvent } from '../services/settle';

const router = Router();

const CreateEventSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  budget: z.number().optional().default(0)
});

const JoinEventSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  alias: z.string().optional(),
  expenses: z.array(z.object({
    total_amount: z.number().min(0),
    items: z.array(z.object({
      name: z.string().min(1),
      amount: z.number().min(0)
    }))
  })).optional(),
  admin_token: z.string().optional(),
  participant_token: z.string().optional()
});

const EditParticipantSchema = z.object({
  admin_token: z.string().min(1, 'admin_token is required'),
  alias: z.string().optional(),
  expenses: z.array(z.object({
    total_amount: z.number().min(0),
    items: z.array(z.object({
      name: z.string().min(1),
      amount: z.number().min(0)
    }))
  })).optional()
});

// POST /api/events
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, budget } = CreateEventSchema.parse(req.body);
    const admin_token = uuidv4();
    const event = await prisma.event.create({
      data: { name, budget, admin_token }
    });
    res.json({
      event_id: event.id,
      share_token: event.share_token,
      admin_token: event.admin_token
    });
  } catch (err) { next(err); }
});

// POST /api/events/:share_token/join
router.post('/:share_token/join', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { share_token } = req.params;
    const { name, alias, expenses, admin_token, participant_token } = JoinEventSchema.parse(req.body);

    const event = await prisma.event.findUnique({ where: { share_token } });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    if (event.status !== 'open') return res.status(400).json({ error: 'Event is closed' });

    let participant;

    if (participant_token) {
      participant = await prisma.participant.findUnique({ where: { participant_token } });
      if (!participant || participant.event_id !== event.id) {
        return res.status(401).json({ error: 'Invalid token' });
      }
      await prisma.participant.update({
        where: { id: participant.id },
        data: { name, alias: alias || null }
      });
      await prisma.expenseItem.deleteMany({
        where: { expense: { participant_id: participant.id, event_id: event.id } }
      });
      await prisma.expense.deleteMany({
        where: { participant_id: participant.id, event_id: event.id }
      });
    } else {
      const existingParticipants = await prisma.participant.findMany({ where: { event_id: event.id } });
      const is_creator = Boolean(
        (admin_token && admin_token === event.admin_token) || existingParticipants.length === 0
      );
      participant = await prisma.participant.create({
        data: { event_id: event.id, name, alias: alias || null, is_creator }
      });
    }

    const existingParticipants = await prisma.participant.findMany({ where: { event_id: event.id } });
    const allParticipantIds = [...existingParticipants.map(p => ({ id: p.id })), { id: participant.id }];

    const existingItems = await prisma.expenseItem.findMany({
      where: { expense: { event_id: event.id } }
    });
    await Promise.all(
      existingItems.map(item =>
        prisma.expenseItem.update({
          where: { id: item.id },
          data: { consumers: { connect: { id: participant.id } } }
        })
      )
    );

    if (expenses && expenses.length > 0) {
      await Promise.all(
        expenses.map(e =>
          prisma.expense.create({
            data: {
              participant_id: participant.id,
              event_id: event.id,
              total_amount: e.total_amount,
              items: {
                create: e.items.map(it => ({
                  name: it.name,
                  amount: it.amount,
                  consumers: { connect: allParticipantIds }
                }))
              }
            }
          })
        )
      );
    }

    res.json({
      participant_id: participant.id,
      participant_token: participant.participant_token
    });
  } catch (err) { next(err); }
});

// PUT /api/events/:share_token/participants/:participant_id
router.put('/:share_token/participants/:participant_id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { share_token, participant_id } = req.params;
    const { admin_token, alias, expenses } = EditParticipantSchema.parse(req.body);

    const event = await prisma.event.findUnique({ where: { share_token } });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    if (!event.admin_token || event.admin_token !== admin_token) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const participant = await prisma.participant.findUnique({ where: { id: participant_id } });
    if (!participant || participant.event_id !== event.id) {
      return res.status(404).json({ error: 'Participant not found' });
    }

    if (alias !== undefined) {
      await prisma.participant.update({
        where: { id: participant_id },
        data: { alias: alias || null }
      });
    }

    await prisma.expenseItem.deleteMany({
      where: { expense: { participant_id, event_id: event.id } }
    });
    await prisma.expense.deleteMany({
      where: { participant_id, event_id: event.id }
    });

    if (expenses && expenses.length > 0) {
      const allParticipants = await prisma.participant.findMany({ where: { event_id: event.id } });
      const allParticipantIds = allParticipants.map(p => ({ id: p.id }));

      await Promise.all(
        expenses.map(e =>
          prisma.expense.create({
            data: {
              participant_id,
              event_id: event.id,
              total_amount: e.total_amount,
              items: {
                create: e.items.map(it => ({
                  name: it.name,
                  amount: it.amount,
                  consumers: { connect: allParticipantIds }
                }))
              }
            }
          })
        )
      );
    }

    res.json({ success: true });
  } catch (err) { next(err); }
});

// GET /api/events/:share_token
router.get('/:share_token', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const event = await prisma.event.findUnique({
      where: { share_token: req.params.share_token },
      include: {
        participants: true,
        expenses: { include: { items: { include: { consumers: true } }, participant: true } },
        debts: { include: { from_participant: true, to_participant: true } }
      }
    });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (err) { next(err); }
});

// GET /api/events/:share_token/admin-token
router.get('/:share_token/admin-token', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { share_token } = req.params;
    const participant_token = req.headers['x-participant-token'] as string;
    if (!participant_token) return res.status(401).json({ error: 'Missing participant token' });

    const event = await prisma.event.findUnique({ where: { share_token } });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    if (!event.admin_token) return res.status(404).json({ error: 'No admin token for this event' });

    const participant = await prisma.participant.findFirst({
      where: { participant_token, event_id: event.id, is_creator: true }
    });
    if (!participant) return res.status(403).json({ error: 'Not the creator' });

    res.json({ admin_token: event.admin_token });
  } catch (err) { next(err); }
});

// POST /api/events/:share_token/settle
router.post('/:share_token/settle', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await settleEvent(req.params.share_token, req.params.share_token);
    res.json(result);
  } catch (err: any) {
    if (err.message === 'Event not found') return res.status(404).json({ error: err.message });
    if (err.message === 'Already settled') return res.status(400).json({ error: err.message });
    next(err);
  }
});

// POST /api/events/:share_token/revert
router.post('/:share_token/revert', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const event = await prisma.event.findUnique({ where: { share_token: req.params.share_token } });
    if (!event) return res.status(404).json({ error: 'Event not found' });

    await prisma.debt.deleteMany({ where: { event_id: event.id } });
    await prisma.event.update({ where: { id: event.id }, data: { status: 'open' } });
    res.json({ status: 'open' });
  } catch (err) { next(err); }
});

export default router;
