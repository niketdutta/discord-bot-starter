const path = require('node:path');
const { loadModules } = require('../utils/fileLoader');
const { handleInteractionError } = require('../utils/errorHandler');

const BUTTONS_DIR = path.join(__dirname, '..', 'components', 'buttons');

/**
 * Recursively loads every module under `components/buttons` (see
 * structures/Component.js) into `client.buttons`, keyed by its `customId`
 * (string or RegExp, used as-is as the Collection key).
 *
 * @param {import('../structures/BotClient')} client
 */
function loadButtons(client) {
  const modules = loadModules(BUTTONS_DIR);

  for (const { filePath, module } of modules) {
    if (!module?.customId || typeof module.execute !== 'function') {
      client.logger.warn(`Skipped invalid button file: ${filePath}`);
      continue;
    }
    client.buttons.set(module.customId, module);
  }

  client.logger.info(`Loaded ${client.buttons.size} button handler(s).`);
}

/**
 * Resolves the button registered for a given customId: an exact string
 * match is tried first, then each RegExp-keyed entry is tested in
 * registration order. RegExp customIds let one handler cover dynamic IDs
 * like `delete_123` via a pattern such as `/^delete_\d+$/`.
 *
 * @param {import('../structures/BotClient')} client
 * @param {string} customId
 */
function resolveButton(client, customId) {
  if (client.buttons.has(customId)) return client.buttons.get(customId);
  return client.buttons.find((button) => button.customId instanceof RegExp && button.customId.test(customId));
}

/**
 * @param {import('../structures/BotClient')} client
 * @param {import('discord.js').ButtonInteraction} interaction
 */
async function handleButtonInteraction(client, interaction) {
  const button = resolveButton(client, interaction.customId);
  if (!button) {
    client.logger.warn(`Received unknown button interaction: ${interaction.customId}`);
    return;
  }

  try {
    await button.execute(interaction, client);
  } catch (error) {
    await handleInteractionError(interaction, error, client);
  }
}

module.exports = { loadButtons, handleButtonInteraction };
