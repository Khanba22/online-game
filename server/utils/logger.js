const config = require('../config/config');

class Logger {
  constructor() {
    this.level = config.logging.level;
    this.enableConsole = config.logging.enableConsole;
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
  }

  log(level, message, meta = {}) {
    if (this.enableConsole) {
      const formattedMessage = this.formatMessage(level, message, meta);
      
      switch (level) {
        case 'error':
          console.error(formattedMessage);
          break;
        case 'warn':
          console.warn(formattedMessage);
          break;
        case 'info':
          console.info(formattedMessage);
          break;
        case 'debug':
          console.debug(formattedMessage);
          break;
        default:
          console.log(formattedMessage);
      }
    }
  }

  error(message, meta = {}) {
    this.log('error', message, meta);
  }

  warn(message, meta = {}) {
    this.log('warn', message, meta);
  }

  info(message, meta = {}) {
    this.log('info', message, meta);
  }

  debug(message, meta = {}) {
    this.log('debug', message, meta);
  }

  // Game-specific logging methods
  gameEvent(event, data = {}) {
    this.info(`Game Event: ${event}`, data);
  }

  playerAction(player, action, data = {}) {
    this.info(`Player Action: ${player} - ${action}`, data);
  }

  roomEvent(roomId, event, data = {}) {
    this.info(`Room Event: ${roomId} - ${event}`, data);
  }

  socketEvent(socketId, event, data = {}) {
    this.debug(`Socket Event: ${socketId} - ${event}`, data);
  }
}

module.exports = new Logger();
