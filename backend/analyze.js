const { PrismaClient } = require('./node_modules/@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const latestEvent = await prisma.event.findFirst({
    orderBy: { created_at: 'desc' },
    include: {
      participants: true,
      expenses: { include: { items: { include: { consumers: true } } } },
      debts: true
    }
  });
  
  console.log("ITEMS BOUGHT:");
  latestEvent.expenses.forEach(e => {
    e.items.forEach(it => {
        console.log(`- ${it.name} | Amount: ${it.amount} | Buyers: ${it.consumers.map(c=>c.name).join(', ')}`);
    })
  });
}
main().then(()=>prisma.$disconnect());
