import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

router.use((req: Request, res: Response, next) => {
  const key = req.headers['x-admin-key'];
  if (!key || key !== process.env.ADMIN_API_KEY) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
});

router.get('/stats', async (_req: Request, res: Response) => {
  const [
    totalEvents,
    eventsByStatus,
    totalParticipants,
    participantsPerEvent,
    expenseAgg,
    activeEventCount,
    recentEvents,
  ] = await Promise.all([
    prisma.event.count(),
    prisma.event.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.participant.count(),
    prisma.participant.groupBy({ by: ['event_id'], _count: { _all: true } }),
    prisma.expense.aggregate({ _sum: { total_amount: true }, _count: { _all: true } }),
    prisma.event.count({ where: { expenses: { some: {} } } }),
    prisma.event.findMany({
      orderBy: { created_at: 'desc' },
      take: 10,
      select: {
        id: true,
        name: true,
        status: true,
        created_at: true,
        share_token: true,
        _count: { select: { participants: true, expenses: true } },
      },
    }),
  ]);

  const statusMap: Record<string, number> = {};
  for (const row of eventsByStatus) statusMap[row.status] = row._count._all;

  const counts = participantsPerEvent.map(r => r._count._all);
  const avgParticipants = counts.length
    ? Math.round((counts.reduce((a, b) => a + b, 0) / counts.length) * 10) / 10
    : 0;

  const closed = statusMap['closed'] ?? 0;
  const conversionRate = totalEvents > 0
    ? Math.round((closed / totalEvents) * 1000) / 10
    : 0;

  res.json({
    events: {
      total: totalEvents,
      open: statusMap['open'] ?? 0,
      settled: statusMap['settled'] ?? 0,
      closed,
      active: activeEventCount,
      conversionRate,
    },
    participants: {
      total: totalParticipants,
      avgPerEvent: avgParticipants,
    },
    money: {
      totalMoved: Math.round(((expenseAgg._sum.total_amount ?? 0)) * 100) / 100,
      totalExpenses: expenseAgg._count._all,
    },
    recentEvents,
  });
});

export default router;
