const path = require('node:path');
const { loadModules } = require('../utils/fileLoader');
const { checkPermissions } = require('../managers/PermissionManager');
const { handleInteractionError } = require('../utils/errorHandler');

const CONTEXT_MENUS_DIR = path.join(__dirname, '..', 'commands', 'context');

/**
 * Recursively loads every module under `commands/context` (see
 * structures/ContextMenuCommand.js) into `client.contextMenus`, keyed by
 * command name. Registration with Discord (the REST PUT call) happens
 * separately in scripts/deploy-commands.js.
 *
 * @param {import('../structures/BotClient')} client
 */
function loadContextMenus(client) {
  const modules = loadModules(CONTEXT_MENUS_DIR);

  for (const { filePath, module } of modules) {
    if (!module?.data?.name || typeof module.execute !== 'function') {
      client.logger.warn(`Skipped invalid context menu command file: ${filePath}`);
      continue;
    }
    client.contextMenus.set(module.data.name, module);
  }

  client.logger.info(`Loaded ${client.contextMenus.size} context menu command(s).`);
}

/**
 * Dispatches a ContextMenuCommandInteraction (User or Message context menu)
 * the same way handleSlashCommand dispatches chat input commands: permission
 * check, cooldown check, then execute with errors funneled through the
 * shared error handler.
 *
 * @param {import('../structures/BotClient')} client
 * @param {import('discord.js').ContextMenuCommandInteraction} interaction
 */
async function handleContextMenuInteraction(client, interaction) {
  const command = client.contextMenus.get(interaction.commandName);
  if (!command) {
    client.logger.warn(`Received unknown context menu command: ${interaction.commandName}`);
    return;
  }

  const { allowed, reason } = checkPermissions({
    member: interaction.member,
    channel: interaction.channel,
    command,
  });
  if (!allowed) {
    await interaction.reply({ content: reason, ephemeral: true });
    return;
  }

  const cooldown = client.cooldowns.check(
    `context:${command.data.name}`,
    interaction.user.id,
    command.cooldown,
  );
  if (cooldown.onCooldown) {
    await interaction.reply({
      content: `Please wait ${cooldown.remainingSeconds.toFixed(1)}s before using this command again.`,
      ephemeral: true,
    });
    return;
  }

  try {
    await command.execute(interaction, client);
  } catch (error) {
    await handleInteractionError(interaction, error, client);
  }
}

module.exports = { loadContextMenus, handleContextMenuInteraction };
