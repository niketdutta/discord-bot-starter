const pino = require('pino');

/**
 * Creates a namespaced pino logger. Both the bot and the backend call this
 * with their own service name so log lines can be told apart in aggregation.
 *
 * @param {string} name - Service/module name shown in each log line.
 * @returns {import('pino').Logger}
 */
function createLogger(name) {
  const isProduction = process.env.NODE_ENV === 'production';

  return pino({
    name,
    level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
    transport: isProduction
      ? undefined
      : {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
            messageFormat: '{if name}[{name}] {end}{msg}',
          },
        },
  });
}

module.exports = { createLogger };
