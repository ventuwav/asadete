import prisma from '../lib/prisma';

interface Participant { id: string }
interface Consumer { id: string }
interface ExpenseItem { amount: number; consumers: Consumer[] }
interface Expense { participant_id: string; total_amount: number; items: ExpenseItem[] }

interface EventData {
  id: string;
  participants: Participant[];
  expenses: Expense[];
}

interface DebtToCreate {
  event_id: string;
  from_participant_id: string;
  to_participant_id: string;
  amount: number;
  status: string;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function calculateDebts(event: EventData): DebtToCreate[] {
  const { id: event_id, participants, expenses } = event;

  const consumptionMap: Record<string, number> = {};
  for (const p of participants) consumptionMap[p.id] = 0;

  for (const expense of expenses) {
    for (const item of expense.items) {
      if (item.consumers.length > 0) {
        const costPerConsumer = item.amount / item.consumers.length;
        for (const consumer of item.consumers) {
          if (consumptionMap[consumer.id] !== undefined) {
            consumptionMap[consumer.id] += costPerConsumer;
          }
        }
      }
    }
  }

  const balances = participants.map(p => {
    const paid = expenses
      .filter(e => e.participant_id === p.id)
      .reduce((sum, e) => sum + e.total_amount, 0);
    const consumed = consumptionMap[p.id] ?? 0;
    return { p_id: p.id, net: round2(paid - consumed) };
  });

  const debtors = balances
    .filter(b => b.net < 0)
    .map(b => ({ ...b, net: Math.abs(b.net) }))
    .sort((a, b) => b.net - a.net);

  const creditors = balances
    .filter(b => b.net > 0)
    .sort((a, b) => b.net - a.net);

  const debtsToCreate: DebtToCreate[] = [];

  while (debtors.length > 0 && creditors.length > 0) {
    const debtor = debtors[0];
    const creditor = creditors[0];
    const amount = round2(Math.min(debtor.net, creditor.net));

    if (amount > 0) {
      debtsToCreate.push({
        event_id,
        from_participant_id: debtor.p_id,
        to_participant_id: creditor.p_id,
        amount,
        status: 'pending'
      });
    }

    debtor.net = round2(debtor.net - amount);
    creditor.net = round2(creditor.net - amount);

    if (debtor.net <= 0) debtors.shift();
    if (creditor.net <= 0) creditors.shift();
  }

  return debtsToCreate;
}

export async function settleEvent(eventId: string, shareToken: string) {
  const event = await prisma.event.findUnique({
    where: { share_token: shareToken },
    include: {
      participants: true,
      expenses: { include: { items: { include: { consumers: true } } } },
      debts: true
    }
  });

  if (!event) throw new Error('Event not found');
  if (event.status !== 'open') throw new Error('Already settled');

  await prisma.debt.deleteMany({ where: { event_id: event.id } });

  if (event.participants.length === 0) {
    await prisma.event.update({ where: { id: event.id }, data: { status: 'settled' } });
    return { status: 'settled', debts: [] };
  }

  const debtsToCreate = calculateDebts(event);

  for (const debt of debtsToCreate) {
    await prisma.debt.create({ data: debt });
  }

  await prisma.event.update({ where: { id: event.id }, data: { status: 'settled' } });

  return { status: 'settled', debts: debtsToCreate };
}
