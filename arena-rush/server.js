// Arena Rush game server: static files + WebSocket transport around shared/game.js.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WebSocketServer } from 'ws';
import { config, connect, start } from './shared/game.js';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3000;
if (process.env.BOTS !== undefined) config.bots = Number(process.env.BOTS);

// ---------- static files ----------
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon' };
const server = http.createServer((req, res) => {
  const url = decodeURIComponent((req.url || '/').split('?')[0]);
  if (url === '/health') { res.writeHead(200); res.end('ok'); return; }
  let base = path.join(ROOT, 'public'), rel = url === '/' ? 'index.html' : url;
  if (url.startsWith('/shared/')) base = ROOT;
  if (url.startsWith('/vendor/')) { base = path.join(ROOT, 'node_modules', 'three', 'build'); rel = url.slice('/vendor/'.length); }
  const file = path.normalize(path.join(base, rel));
  if (!file.startsWith(base + path.sep)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end('not found'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(data);
  });
});

// ---------- networking ----------
const wss = new WebSocketServer({ server, maxPayload: 8 * 1024 });
wss.on('connection', (ws) => {
  const conn = connect(ws);
  ws.on('message', conn.message);
  ws.on('close', conn.close);
});

start();
server.listen(PORT, () => console.log(`Arena Rush running on http://localhost:${PORT}`));
