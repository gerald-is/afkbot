// lib/antiAfk.js
// Keeps the bot looking "alive": random walking, looking around, jumping,
// and treading water if it ends up submerged. All timers are cleaned up
// via stop() so reconnect cycles don't leak intervals.

const log = require('./logger');

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function startAntiAfk(bot, cfg) {
  if (!cfg.antiAfk.enabled) return () => {};

  let stopped = false;
  let timeoutHandle = null;

  function scheduleNext() {
    if (stopped) return;
    const delay = randomBetween(cfg.antiAfk.minIntervalMs, cfg.antiAfk.maxIntervalMs);
    timeoutHandle = setTimeout(tick, delay);
  }

  function tick() {
    if (stopped || !bot.entity) return scheduleNext();

    try {
      // Random short walk
      if (cfg.antiAfk.randomMovement) {
        const directions = ['forward', 'back', 'left', 'right'];
        const dir = directions[randomBetween(0, directions.length - 1)];
        const duration = randomBetween(600, 1800);

        bot.setControlState(dir, true);
        setTimeout(() => {
          if (bot.entity) bot.setControlState(dir, false);
        }, duration);
      }

      // Random look around (yaw + slight pitch)
      if (cfg.antiAfk.randomLook) {
        const yaw = Math.random() * Math.PI * 2;
        const pitch = (Math.random() - 0.5) * 0.6;
        bot.look(yaw, pitch, true);
      }

      // Occasional jump
      if (cfg.antiAfk.jump && Math.random() < 0.35) {
        bot.setControlState('jump', true);
        setTimeout(() => {
          if (bot.entity) bot.setControlState('jump', false);
        }, 250);
      }

      // Tread water if submerged so the bot doesn't drown
      if (cfg.antiAfk.swimIfInWater && bot.entity && bot.entity.isInWater) {
        bot.setControlState('jump', true);
        setTimeout(() => {
          if (bot.entity) bot.setControlState('jump', false);
        }, 400);
      }
    } catch (err) {
      log.warn(`Anti-AFK tick error: ${err.message}`);
    }

    scheduleNext();
  }

  scheduleNext();

  return function stop() {
    stopped = true;
    if (timeoutHandle) clearTimeout(timeoutHandle);
    try {
      ['forward', 'back', 'left', 'right', 'jump', 'sneak'].forEach((s) =>
        bot.setControlState(s, false)
      );
    } catch (_) {
      /* bot may already be disconnected */
    }
  };
}

module.exports = { startAntiAfk };
