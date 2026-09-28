const path = require('node:path');
const { loadModules } = require('../utils/fileLoader');
const { handleInteractionError } = require('../utils/errorHandler');

const MODALS_DIR = path.join(__dirname, '..', 'components', 'modals');

/**
 * Recursively loads every module under `components/modals` (see
 * structures/Component.js) into `client.modals`, keyed by its `customId`.
 *
 * @param {import('../structures/BotClient')} client
 */
function loadModals(client) {
  const modules = loadModules(MODALS_DIR);

  for (const { filePath, module } of modules) {
    if (!module?.customId || typeof module.execute !== 'function') {
      client.logger.warn(`Skipped invalid modal file: ${filePath}`);
      continue;
    }
    client.modals.set(module.customId, module);
  }

  client.logger.info(`Loaded ${client.modals.size} modal handler(s).`);
}

/**
 * Same exact-then-pattern resolution strategy as buttons (see
 * handlers/buttonHandler.js) — useful for modals submitted from a dynamic
 * source, e.g. `edit_note_123`.
 *
 * @param {import('../structures/BotClient')} client
 * @param {string} customId
 */
function resolveModal(client, customId) {
  if (client.modals.has(customId)) return client.modals.get(customId);
  return client.modals.find((modal) => modal.customId instanceof RegExp && modal.customId.test(customId));
}

/**
 * @param {import('../structures/BotClient')} client
 * @param {import('discord.js').ModalSubmitInteraction} interaction
 */
async function handleModalInteraction(client, interaction) {
  const modal = resolveModal(client, interaction.customId);
  if (!modal) {
    client.logger.warn(`Received unknown modal submission: ${interaction.customId}`);
    return;
  }

  try {
    await modal.execute(interaction, client);
  } catch (error) {
    await handleInteractionError(interaction, error, client);
  }
}

module.exports = { loadModals, handleModalInteraction };
