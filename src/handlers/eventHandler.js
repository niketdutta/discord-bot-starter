const path = require('node:path');
const { loadModules } = require('../utils/fileLoader');

const EVENTS_DIR = path.join(__dirname, '..', 'events');

/**
 * Recursively loads every module under `events/**` (see structures/Event.js)
 * and binds it to the client via `.on`/`.once` as declared. Unlike the
 * command handlers, events don't need a separate dispatch function — once
 * bound, discord.js calls `execute` directly.
 *
 * @param {import('../structures/BotClient')} client
 */
function loadEvents(client) {
  const modules = loadModules(EVENTS_DIR);
  let count = 0;

  for (const { filePath, module } of modules) {
    if (!module?.name || typeof module.execute !== 'function') {
      client.logger.warn(`Skipped invalid event file: ${filePath}`);
      continue;
    }

    const bind = module.once ? client.once.bind(client) : client.on.bind(client);
    bind(module.name, (...args) => module.execute(client, ...args));
    count += 1;
  }

  client.logger.info(`Loaded ${count} event(s).`);
}

module.exports = { loadEvents };
