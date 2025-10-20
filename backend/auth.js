import https from 'https';
import fs from 'fs';
import os from 'os';
import * as daikinAuth from './scripts/daikinAuth.js';


//Käynnistää serverin jolla voi hankkia tokenin. 


const handler = (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if(req.url === '/daikinAuth') daikinAuth.openUrl(req,res);
  else if(req.url.startsWith('/?code=')) daikinAuth.code(req,res);
  else {
    res.writeHead(404);
    res.end('page not found');
  }
};

const options = {
  key: fs.readFileSync('selfsigned.key'),
  cert: fs.readFileSync('selfsigned.crt')
};
https.createServer(options, handler).listen(3443, () => {
  //console.log('HTTPS server running on port 3443');
});

const interfaces = os.networkInterfaces();
for (const name of Object.keys(interfaces)) {
  for (const iface of interfaces[name]) {
    if (iface.family === 'IPv4' && !iface.internal) {
        console.log(" ")
        console.log(`Hae Daikin Auth token: https://${iface.address}:3443/daikinAuth`);
        console.log(" ")
    }
  }
}

