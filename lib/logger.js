// lib/logger.js
// Tiny dependency-free logger with timestamps and colored levels.

const COLORS = {
  reset: '\x1b[0m',
  gray: '\x1b[90m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m'
};

function timestamp() {
  const d = new Date();
  return d.toLocaleTimeString('en-US', { hour12: false });
}

function format(tag, color, msg) {
  return `${COLORS.gray}[${timestamp()}]${COLORS.reset} ${color}${tag}${COLORS.reset} ${msg}`;
}

module.exports = {
  info: (msg) => console.log(format('INFO ', COLORS.cyan, msg)),
  success: (msg) => console.log(format('OK   ', COLORS.green, msg)),
  warn: (msg) => console.log(format('WARN ', COLORS.yellow, msg)),
  error: (msg) => console.log(format('ERROR', COLORS.red, msg)),
  chat: (msg) => console.log(format('CHAT ', COLORS.magenta, msg))
};
