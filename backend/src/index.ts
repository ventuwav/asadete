import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const prisma = new PrismaClient();

// ==========================================
// 4.1 Crear evento
app.post('/api/events', async (req, res) => {
  try {
    const { name, budget } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });

    const admin_token = uuidv4();
    const event = await prisma.event.create({
      data: { name, budget: parseFloat(budget) || 0, admin_token }
    });

    res.json({
      event_id: event.id,
      share_link: `http://localhost:5173/e/${event.share_token}`,
      share_token: event.share_token,
      admin_token: event.admin_token
    });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// 4.1b Admin: Edit any participant's expenses
app.put('/api/events/:share_token/participants/:participant_id', async (req, res) => {
  try {
    const { share_token, participant_id } = req.params;
    const { admin_token, alias, expenses } = req.body;

    const event = await prisma.event.findUnique({ where: { share_token } });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    if (!event.admin_token || event.admin_token !== admin_token) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const participant = await prisma.participant.findUnique({ where: { id: participant_id } });
    if (!participant || participant.event_id !== event.id) {
      return res.status(404).json({ error: 'Participant not found' });
    }

    // Update alias if provided
    if (alias !== undefined) {
      await prisma.participant.update({
        where: { id: participant_id },
        data: { alias: alias || null }
      });
    }

    // Replace expenses
    await prisma.expenseItem.deleteMany({
      where: { expense: { participant_id, event_id: event.id } }
    });
    await prisma.expense.deleteMany({
      where: { participant_id, event_id: event.id }
    });

    const allParticipants = await prisma.participant.findMany({ where: { event_id: event.id } });
    const allParticipantIds = allParticipants.map(p => ({ id: p.id }));

    if (expenses && Array.isArray(expenses)) {
      await Promise.all(
        expenses.map((e: any) =>
          prisma.expense.create({
            data: {
              participant_id,
              event_id: event.id,
              total_amount: e.total_amount,
              items: {
                create: (e.items || []).map((it: any) => ({
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
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// 4.2 Unirse al evento
app.post('/api/events/:share_token/join', async (req, res) => {
  try {
    const { share_token } = req.params;
    const { name, alias, expenses, admin_token, participant_token } = req.body; 
    
    // Validaciones
    if (!name) return res.status(400).json({ error: "Name is required" });

    const event = await prisma.event.findUnique({
      where: { share_token }
    });
    if (!event) return res.status(404).json({ error: "Event not found" });
    if (event.status !== 'open') return res.status(400).json({ error: "Event is closed" });

    let participant;
    
    if (participant_token) {
       participant = await prisma.participant.findUnique({ where: { participant_token } });
       if (!participant || participant.event_id !== event.id) return res.status(401).json({error: "Invalid token"});
       
       await prisma.participant.update({
          where: { id: participant.id },
          data: { name, alias: alias || null }
       });

       // Destroy previous expenses and items for this participant to re-write them
       await prisma.expenseItem.deleteMany({
          where: { expense: { participant_id: participant.id, event_id: event.id } }
       });
       await prisma.expense.deleteMany({
          where: { participant_id: participant.id, event_id: event.id }
       });
    } else {
      const existingParticipants = await prisma.participant.findMany({ where: { event_id: event.id } });
      // Authorization: Grant DT if they possess the crypto token, or if they are genuinely the first physical participant
      const is_creator = Boolean((admin_token && admin_token === event.admin_token) || existingParticipants.length === 0);

      participant = await prisma.participant.create({
        data: {
          event_id: event.id,
          name,
          alias: alias || null,
          is_creator
        }
      });
    }

    const existingParticipants = await prisma.participant.findMany({ where: { event_id: event.id } });

    const allParticipantIds = [...existingParticipants.map(p => ({ id: p.id })), { id: participant.id }];

    const existingItems = await prisma.expenseItem.findMany({ where: { expense: { event_id: event.id } } });
    await Promise.all(
      existingItems.map(item =>
        prisma.expenseItem.update({
          where: { id: item.id },
          data: { consumers: { connect: { id: participant.id } } }
        })
      )
    );

    if (expenses && Array.isArray(expenses)) {
      await Promise.all(
        expenses.map(e =>
          prisma.expense.create({
            data: {
              participant_id: participant.id,
              event_id: event.id,
              total_amount: e.total_amount,
              items: {
                create: (e.items || []).map((it:any) => ({
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
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// 4.3 Obtener evento
app.get('/api/events/:share_token', async (req, res) => {
  try {
    const event = await prisma.event.findUnique({
      where: { share_token: req.params.share_token },
      include: {
        participants: true,
        expenses: { include: { items: { include: { consumers: true } }, participant: true } },
        debts: { include: { from_participant: true, to_participant: true } }
      }
    });
    if (!event) return res.status(404).json({ error: "Event not found" });

    res.json(event);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// 4.4 Get admin token for creator (authenticated by participant_token)
app.get('/api/events/:share_token/admin-token', async (req, res) => {
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
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// 4.5 Liquidar evento (Optimized Transfers)
app.post('/api/events/:share_token/settle', async (req, res) => {
  try {
    const event = await prisma.event.findUnique({
      where: { share_token: req.params.share_token },
      include: { 
        participants: true, 
        expenses: { include: { items: { include: { consumers: true } } } }, 
        debts: true 
      }
    });
    if (!event) return res.status(404).json({ error: "Event not found" });
    if (event.status !== "open") return res.status(400).json({ error: "Already settled" });

    await prisma.debt.deleteMany({ where: { event_id: event.id } });

    const num_participants = event.participants.length;
    if (num_participants === 0) return res.json({ status: "settled", debts: [] });

    const paidMap: Record<string, number> = {};
    const consumptionMap: Record<string, number> = {};
    
    for (const p of event.participants) {
      paidMap[p.id] = 0;
      consumptionMap[p.id] = 0;
    }
    
    for (const e of event.expenses) {
      if (paidMap[e.participant_id] !== undefined) {
          paidMap[e.participant_id] += e.total_amount;
      }
      for (const item of e.items) {
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

     // Calcular netos: Pagado - Consumido (Cents rounded safely to nearest whole integer strictly to prevent IEEE 754 precision ghosts)
    const dataEvent = event; // Alias for clarity with new code structure
    const balances = dataEvent.participants.map(p => {
      const paid = dataEvent.expenses.filter(e => e.participant_id === p.id).reduce((sum, e) => sum + e.total_amount, 0);
      const consumed = consumptionMap[p.id] || 0;
      return { p_id: p.id, net: Math.round((paid - consumed) * 100) / 100 }; 
    });
    let debtors = balances.filter(b => b.net < 0).map(b => ({ ...b, net: Math.abs(b.net) }));
    let creditors = balances.filter(b => b.net > 0);

    debtors.sort((a, b) => b.net - a.net);
    creditors.sort((a, b) => b.net - a.net);

    const debtsToCreate = [];
    while (debtors.length > 0 && creditors.length > 0) {
      const debtor = debtors[0];
      const creditor = creditors[0];

      const amount = Math.min(debtor.net, creditor.net);
      const safeAmount = Math.round(amount * 100) / 100;

      if (safeAmount > 0) {
        debtsToCreate.push({
          event_id: event.id,
          from_participant_id: debtor.p_id,
          to_participant_id: creditor.p_id,
          amount: safeAmount,
          status: "pending" // Assuming a default status for new debts
        });
      }

      debtor.net = Math.round((debtor.net - safeAmount) * 100) / 100;
      creditor.net = Math.round((creditor.net - safeAmount) * 100) / 100;

      if (debtor.net <= 0) debtors.shift();
      if (creditor.net <= 0) creditors.shift();
    }

    for (const debt of debtsToCreate) {
      await prisma.debt.create({ data: debt });
    }

    await prisma.event.update({
      where: { id: event.id },
      data: { status: "settled" }
    });

    res.json({ status: "settled", debts: debtsToCreate });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// 4.7 Marcar pago POST /debts/:id/pay
app.post('/api/debts/:id/pay', async (req, res) => {
  try {
    const debt = await prisma.debt.update({
      where: { id: req.params.id },
      data: { status: "paid" }
    });
    res.json(debt);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// 4.8 Confirmar pago POST /debts/:id/confirm
app.post('/api/debts/:id/confirm', async (req, res) => {
  try {
    const debt = await prisma.debt.update({
      where: { id: req.params.id },
      data: { status: "confirmed" }
    });

    const pendingDebts = await prisma.debt.count({
      where: { event_id: debt.event_id, status: { not: "confirmed" } }
    });

    if (pendingDebts === 0) {
      await prisma.event.update({
        where: { id: debt.event_id },
        data: { status: "closed" }
      });
    }

    res.json(debt);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// 4.9 Revertir liquidacion
app.post('/api/events/:share_token/revert', async (req, res) => {
  try {
    const event = await prisma.event.findUnique({ where: { share_token: req.params.share_token } });
    if (!event) return res.status(404).json({ error: "Event not found" });

    await prisma.debt.deleteMany({ where: { event_id: event.id } });
    await prisma.event.update({
      where: { id: event.id },
      data: { status: "open" }
    });
    res.json({ status: "open" });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// 4.10 Toggle Consumer
app.post('/api/items/:id/toggle', async (req, res) => {
  try {
    const { participant_id } = req.body;
    const item = await prisma.expenseItem.findUnique({
      where: { id: req.params.id },
      include: { consumers: true }
    });
    if (!item) return res.status(404).json({ error: "Item not found" });

    const isConsuming = item.consumers.some(c => c.id === participant_id);
    
    if (isConsuming) {
      await prisma.expenseItem.update({
        where: { id: item.id },
        data: { consumers: { disconnect: { id: participant_id } } }
      });
    } else {
      await prisma.expenseItem.update({
        where: { id: item.id },
        data: { consumers: { connect: { id: participant_id } } }
      });
    }

    res.json({ success: true, isConsuming: !isConsuming });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
