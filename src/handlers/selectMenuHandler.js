const path = require('node:path');
const { loadModules } = require('../utils/fileLoader');
const { handleInteractionError } = require('../utils/errorHandler');

const SELECT_MENUS_DIR = path.join(__dirname, '..', 'components', 'selects');

/**
 * Recursively loads every module under `components/selects` (see
 * structures/Component.js) into `client.selectMenus`, keyed by its
 * `customId`. Covers every select-menu variant (string, user, role,
 * mentionable, channel) since they all surface as `isAnySelectMenu()`.
 *
 * @param {import('../structures/BotClient')} client
 */
function loadSelectMenus(client) {
  const modules = loadModules(SELECT_MENUS_DIR);

  for (const { filePath, module } of modules) {
    if (!module?.customId || typeof module.execute !== 'function') {
      client.logger.warn(`Skipped invalid select menu file: ${filePath}`);
      continue;
    }
    client.selectMenus.set(module.customId, module);
  }

  client.logger.info(`Loaded ${client.selectMenus.size} select menu handler(s).`);
}

/**
 * @param {import('../structures/BotClient')} client
 * @param {string} customId
 */
function resolveSelectMenu(client, customId) {
  if (client.selectMenus.has(customId)) return client.selectMenus.get(customId);
  return client.selectMenus.find(
    (menu) => menu.customId instanceof RegExp && menu.customId.test(customId),
  );
}

/**
 * @param {import('../structures/BotClient')} client
 * @param {import('discord.js').AnySelectMenuInteraction} interaction
 */
async function handleSelectMenuInteraction(client, interaction) {
  const menu = resolveSelectMenu(client, interaction.customId);
  if (!menu) {
    client.logger.warn(`Received unknown select menu interaction: ${interaction.customId}`);
    return;
  }

  try {
    await menu.execute(interaction, client);
  } catch (error) {
    await handleInteractionError(interaction, error, client);
  }
}

module.exports = { loadSelectMenus, handleSelectMenuInteraction };
