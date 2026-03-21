const http = require('http');
const { PrismaClient } = require('./node_modules/@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const latest = await prisma.event.findFirst({ orderBy: { created_at: 'desc' } });
  
  const options = {
    hostname: 'localhost',
    port: 5001,
    path: `/events/${latest.share_token}/settle`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  };

  const req = http.request(options, (res) => {
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
      console.log("STATUS:", res.statusCode);
      console.log("RESPONSE:", rawData);
    });
  });

  req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
  });
  
  req.end();
}
run();
