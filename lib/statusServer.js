// lib/statusServer.js
// Spins up a tiny dependency-free HTTP server that reports bot status as
// JSON, plus a simple HTML page. Many free hosting platforms (Replit,
// Render free tier, etc.) require something listening on a port to keep
// the process alive — this doubles as that "ping target".

const http = require('http');
const log = require('./logger');

function startStatusServer(bot, cfg, getStats) {
  if (!cfg.statusServer.enabled) return null;

  const server = http.createServer((req, res) => {
    const stats = getStats();

    if (req.url === '/status.json') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(stats, null, 2));
      return;
    }

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`<!DOCTYPE html>
<html>
<head>
  <title>${stats.username} - AFK Bot Status</title>
  <meta http-equiv="refresh" content="10">
  <style>
    body { font-family: monospace; background: #111; color: #eee; padding: 2rem; }
    h1 { color: #7CFC00; }
    .row { margin: 0.4rem 0; }
    .label { color: #888; display: inline-block; width: 140px; }
    .online { color: #7CFC00; }
    .offline { color: #ff5555; }
  </style>
</head>
<body>
  <h1>${stats.username}</h1>
  <div class="row"><span class="label">Status:</span> <span class="${stats.connected ? 'online' : 'offline'}">${stats.connected ? 'Connected' : 'Disconnected'}</span></div>
  <div class="row"><span class="label">Server:</span> ${stats.server}</div>
  <div class="row"><span class="label">Health:</span> ${stats.health}/20</div>
  <div class="row"><span class="label">Food:</span> ${stats.food}/20</div>
  <div class="row"><span class="label">Position:</span> ${stats.position}</div>
  <div class="row"><span class="label">Uptime:</span> ${stats.uptime}</div>
  <div class="row"><span class="label">Reconnects:</span> ${stats.reconnects}</div>
</body>
</html>`);
  });

  server.listen(cfg.statusServer.port, () => {
    log.success(`Status server running on http://localhost:${cfg.statusServer.port}`);
  });

  return server;
}

module.exports = { startStatusServer };
