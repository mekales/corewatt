import https from 'https';
import http from 'http';
import fs from 'fs';
import os from 'os';
import * as routes from './scripts/routes.js';
import * as pumpTimer from './scripts/pumpTimer.js';
import cron from 'node-cron';

async function scheduleTasks() {
  cron.schedule('0 0 * * *', () => {
    pumpTimer.createSchedule();
    routes.setTemp();
  });
  cron.schedule('0,15,30,45 * * * *', () => {
    routes.setTemp();
    routes.saveGetDevices();
  });
}

const handler = (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if(req.url === '/getDevices') routes.getDevices(req,res);
  else if(req.url === '/schedule') routes.showSchedule(req,res);
  else if(req.url === '/setPause') routes.setPause(req,res);
  else if(req.url === '/removePause') routes.removePause(req,res);
  else if(req.url === '/showConfig') routes.showConfig(req,res);
  else if(req.url === '/pumpStatus') routes.pumpStatus(req,res);
  else {
    res.writeHead(404);
    res.end('page not found');
  }
};

// HTTPS
const options = {
  key: fs.readFileSync('selfsigned.key'),
  cert: fs.readFileSync('selfsigned.crt')
};
https.createServer(options, handler).listen(3443, () => {
  console.log('HTTPS server running on port 3443');
});

// HTTP
http.createServer(handler).listen(3000, () => {
  console.log('HTTP server running on port 3000');
});

// Tulostetaan kaikki IP-osoitteet URL-muodossa 
const interfaces = os.networkInterfaces();
console.log('Server is accessible at:');
for (const name of Object.keys(interfaces)) {
  for (const iface of interfaces[name]) {
    if (iface.family === 'IPv4' && !iface.internal) {
      console.log(`- HTTP:  http://${iface.address}:3000/`);
      console.log(`- HTTPS: https://${iface.address}:3443/`);
    }
  }
}

async function startFunction(){
  let err=0;
  try{
    await pumpTimer.createSchedule();
  } catch (error){
    err=1;
    console.error("pumpTimer.createSchedule error:", error);
  }

  try{
    await routes.saveGetDevices();
  } catch (error){
    err=2;
    console.error("routes.saveGetDevices error:", error);
  }

  if(err != 0){
    console.log("Ohjelma ei toimi odotetulla tavalla. Ohjelma pysäytetty tähän virhetilaan.");
    while(err != 0){
      console.log("ERR:", err,);
      await new Promise(r => setTimeout(r, 50000)); // printtaa 5 sek välein
    }
  }
}

await startFunction()
scheduleTasks();
