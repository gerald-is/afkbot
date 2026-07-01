// lib/commands.js
// Handles all "!command" chat messages. Keeping this separate from index.js
// makes it easy to add new commands without touching the connection logic.

const log = require('./logger');

const START_TIME = Date.now();

function formatUptime(ms) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h}h ${m}m ${sec}s`;
}

function setupCommands(bot, cfg, mineflayerPathfinder) {
  const prefix = cfg.chat.commandPrefix || '!';
  let followInterval = null;

  function stopFollow() {
    if (followInterval) {
      clearInterval(followInterval);
      followInterval = null;
    }
    if (bot.pathfinder) bot.pathfinder.setGoal(null);
  }

  function reply(username, msg) {
    bot.chat(msg);
    log.chat(`-> ${username}: ${msg}`);
  }

  bot.on('chat', (username, message) => {
    if (username === bot.username) return;
    if (cfg.logging.logChatToConsole) log.chat(`<${username}> ${message}`);

    const lower = message.toLowerCase().trim();

    // Friendly auto-replies (non-command)
    if (!lower.startsWith(prefix)) {
      if (cfg.chat.respondToGreetings) {
        if (lower.includes('hello') || lower.includes('hi ' + bot.username.toLowerCase())) {
          reply(username, `Hi ${username}! Type ${prefix}help to see what I can do.`);
        } else if (lower.includes('how are you')) {
          reply(username, `Running strong, ${username}! Uptime: ${formatUptime(Date.now() - START_TIME)}`);
        }
      }
      return;
    }

    const args = lower.slice(prefix.length).split(/\s+/);
    const command = args.shift();

    switch (command) {
      case 'help': {
        reply(
          username,
          `Commands: ${prefix}help, ${prefix}ping, ${prefix}status, ${prefix}come, ${prefix}goto x y z, ` +
            `${prefix}follow [name], ${prefix}stop, ${prefix}inv, ${prefix}players, ${prefix}time`
        );
        break;
      }

      case 'ping': {
        reply(username, `Pong, ${username}! Latency: ${bot.player?.ping ?? '??'}ms`);
        break;
      }

      case 'status': {
        const pos = bot.entity ? bot.entity.position.floored() : null;
        reply(
          username,
          `HP: ${Math.round(bot.health ?? 0)}/20 | Food: ${Math.round(bot.food ?? 0)}/20 | ` +
            `Pos: ${pos ? `${pos.x}, ${pos.y}, ${pos.z}` : 'unknown'} | ` +
            `Uptime: ${formatUptime(Date.now() - START_TIME)}`
        );
        break;
      }

      case 'players': {
        const names = Object.keys(bot.players).filter((n) => n !== bot.username);
        reply(username, names.length ? `Online: ${names.join(', ')}` : 'No other players visible.');
        break;
      }

      case 'time': {
        const t = bot.time?.timeOfDay ?? 0;
        const isDay = t < 12000;
        reply(username, `Game time: ${t} (${isDay ? 'day' : 'night'})`);
        break;
      }

      case 'inv': {
        const items = bot.inventory.items();
        if (!items.length) {
          reply(username, 'Inventory is empty.');
        } else {
          const summary = items.map((i) => `${i.name} x${i.count}`).slice(0, 8).join(', ');
          reply(username, `Inventory: ${summary}${items.length > 8 ? ', ...' : ''}`);
        }
        break;
      }

      case 'come': {
        if (!bot.pathfinder) {
          reply(username, 'Pathfinder is not loaded.');
          break;
        }
        const target = bot.players[username]?.entity;
        if (!target) {
          reply(username, `I can't see you, ${username}. Get closer first.`);
          break;
        }
        const { goals } = mineflayerPathfinder;
        bot.pathfinder.setGoal(new goals.GoalNear(target.position.x, target.position.y, target.position.z, 1));
        reply(username, `Coming to you, ${username}!`);
        break;
      }

      case 'goto': {
        if (!bot.pathfinder) {
          reply(username, 'Pathfinder is not loaded.');
          break;
        }
        const [x, y, z] = args.map(Number);
        if ([x, y, z].some(Number.isNaN)) {
          reply(username, `Usage: ${prefix}goto x y z`);
          break;
        }
        const { goals } = mineflayerPathfinder;
        bot.pathfinder.setGoal(new goals.GoalBlock(x, y, z));
        reply(username, `Heading to ${x}, ${y}, ${z}...`);
        break;
      }

      case 'follow': {
        if (!bot.pathfinder) {
          reply(username, 'Pathfinder is not loaded.');
          break;
        }
        const targetName = args[0] || username;
        const target = bot.players[targetName]?.entity;
        if (!target) {
          reply(username, `Can't see ${targetName} to follow them.`);
          break;
        }
        stopFollow();
        const { goals } = mineflayerPathfinder;
        followInterval = setInterval(() => {
          const t = bot.players[targetName]?.entity;
          if (t) bot.pathfinder.setGoal(new goals.GoalFollow(t, 2), true);
        }, 1000);
        reply(username, `Following ${targetName}. Say ${prefix}stop to end.`);
        break;
      }

      case 'stop': {
        stopFollow();
        reply(username, 'Stopped moving.');
        break;
      }

      default:
        reply(username, `Unknown command. Try ${prefix}help`);
    }
  });

  return { stopFollow };
}

module.exports = { setupCommands, formatUptime, START_TIME };
