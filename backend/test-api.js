const { PrismaClient } = require('./node_modules/@prisma/client');
const prisma = new PrismaClient();
const http = require('http');

async function test() {
  const latest = await prisma.event.findFirst({ orderBy: { created_at: 'desc' } });
  if (!latest) return console.log("No events");
  console.log("Found token:", latest.share_token);

  http.get(`http://localhost:5001/events/${latest.share_token}`, (resp) => {
    let data = '';
    resp.on('data', (chunk) => { data += chunk; });
    resp.on('end', () => { console.log(data); });
  }).on("error", (err) => { console.log("Error: " + err.message); });
}
test();
