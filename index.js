// index.js
// Advanced Mineflayer AFK bot — entrypoint.
// See README.md for setup instructions.

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const mineflayer = require('mineflayer');
const pathfinderPkg = require('mineflayer-pathfinder');
const autoEatPkg = require('mineflayer-auto-eat');

const log = require('./lib/logger');
const { startAntiAfk } = require('./lib/antiAfk');
const { setupCommands, formatUptime, START_TIME } = require('./lib/commands');
const { startStatusServer } = require('./lib/statusServer');

const { pathfinder, Movements } = pathfinderPkg;
const autoEat = autoEatPkg.plugin;

// ---- Load config (config.json, with optional .env overrides) ----
const configPath = path.join(__dirname, 'config.json');
const cfg = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Allow environment variables to override sensitive/deployment-specific values
if (process.env.MC_HOST) cfg.server.host = process.env.MC_HOST;
if (process.env.MC_PORT) cfg.server.port = Number(process.env.MC_PORT);
if (process.env.MC_VERSION) cfg.server.version = process.env.MC_VERSION;
if (process.env.MC_USERNAME) cfg.bot.username = process.env.MC_USERNAME;
if (process.env.MC_AUTH) cfg.bot.auth = process.env.MC_AUTH;
if (process.env.MC_PASSWORD) cfg.bot.password = process.env.MC_PASSWORD;

let reconnectAttempts = 0;
let currentDelay = cfg.reconnect.delayMs;
let bot = null;
let stopAntiAfk = () => {};

function getStats() {
  return {
    username: cfg.bot.username,
    server: `${cfg.server.host}:${cfg.server.port}`,
    connected: !!(bot && bot.entity),
    health: bot ? Math.round(bot.health ?? 0) : 0,
    food: bot ? Math.round(bot.food ?? 0) : 0,
    position: bot && bot.entity ? bot.entity.position.floored().toString() : 'unknown',
    uptime: formatUptime(Date.now() - START_TIME),
    reconnects: reconnectAttempts
  };
}

function createBot() {
  log.info(`Connecting to ${cfg.server.host}:${cfg.server.port} as ${cfg.bot.username}...`);

 const options = {
    host: cfg.server.host,
    port: cfg.server.port,
    username: cfg.bot.username,
    auth: cfg.bot.auth || 'offline'
  };
  if (cfg.server.version) {
    options.version = cfg.server.version;
  }
  
  if (cfg.bot.auth !== 'microsoft' && cfg.bot.password) {
    options.password = cfg.bot.password;
  }

  bot = mineflayer.createBot(options);

  bot.loadPlugin(pathfinder);
  bot.loadPlugin(autoEat);

  // ---- Connection lifecycle ----
  bot.once('spawn', () => {
    reconnectAttempts = 0;
    currentDelay = cfg.reconnect.delayMs;
    log.success(`Spawned in as ${bot.username}.`);

    // Pathfinder movement profile
    const movements = new Movements(bot);
    bot.pathfinder.setMovements(movements);

    // Auto-eat
    if (cfg.autoEat.enabled && bot.autoEat) {
      bot.autoEat.options = {
        ...bot.autoEat.options,
        priority: 'foodPoints',
        startAt: cfg.autoEat.startAt,
        bannedFood: []
      };
      bot.autoEat.enable();
      log.info('Auto-eat enabled.');
    }

    // Anti-AFK loop
    stopAntiAfk = startAntiAfk(bot, cfg);

    if (cfg.chat.announceOnSpawn) {
      setTimeout(() => {
        bot.chat('AFK bot online! Say !help to see what I can do.');
      }, 1000);
    }
  });

  // ---- Auth / registration handling ----
  bot.on('message', (jsonMsg) => {
    const msg = jsonMsg.toString().toLowerCase();

    if (cfg.auth.autoRegister && msg.includes('/register')) {
      bot.chat(`/register ${cfg.auth.registerLoginPassword} ${cfg.auth.registerLoginPassword}`);
      log.info('Sent /register');
    } else if (cfg.auth.autoLogin && msg.includes('/login')) {
      bot.chat(`/login ${cfg.auth.registerLoginPassword}`);
      log.info('Sent /login');
    }

    if (
      cfg.auth.autoAcceptTeleport &&
      (msg.includes('teleport to you') || msg.includes('teleport to them'))
    ) {
      log.info('Teleport request detected, accepting...');
      bot.chat('/tpaccept');
    }
  });

  bot.on('whisper', (username, message) => {
    if (username === bot.username) return;
    log.chat(`[Whisper] <${username}>: ${message}`);
    bot.whisper(username, `Hi ${username}, I got your whisper! Say !help in chat for commands.`);
  });

  bot.on('health', () => {
    if (bot.health !== undefined && bot.health <= 0) {
      log.warn('Bot died! Will respawn automatically.');
    }
  });

  bot.on('kicked', (reason) => {
    log.warn(`Kicked: ${JSON.stringify(reason)}`);
  });

  bot.on('error', (err) => {
    log.error(`Bot error: ${err.message}`);
  });

  bot.on('end', (reason) => {
    stopAntiAfk();
    log.warn(`Disconnected (${reason || 'unknown reason'}).`);

    if (!cfg.reconnect.enabled) return;

    reconnectAttempts += 1;
    log.info(`Reconnecting in ${Math.round(currentDelay / 1000)}s (attempt ${reconnectAttempts})...`);

    setTimeout(createBot, currentDelay);
    currentDelay = Math.min(currentDelay * 1.5, cfg.reconnect.maxDelayMs);
  });

  // ---- Chat commands ----
  setupCommands(bot, cfg, pathfinderPkg);
}

// ---- Status web server (separate from the bot's lifecycle) ----
startStatusServer(cfg.bot, cfg, getStats);

// ---- Graceful shutdown ----
process.on('SIGINT', () => {
  log.info('Shutting down...');
  stopAntiAfk();
  if (bot) bot.quit();
  process.exit(0);
});

createBot();
