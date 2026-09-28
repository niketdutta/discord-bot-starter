const path = require('node:path');
const { loadModules } = require('../utils/fileLoader');
const { checkPermissions } = require('../managers/PermissionManager');
const { handleInteractionError } = require('../utils/errorHandler');

const SLASH_COMMANDS_DIR = path.join(__dirname, '..', 'commands', 'slash');

/**
 * Recursively loads every module under `commands/slash` (see
 * structures/Command.js for the expected shape) into `client.commands`,
 * keyed by command name.
 *
 * @param {import('../structures/BotClient')} client
 */
function loadCommands(client) {
  const modules = loadModules(SLASH_COMMANDS_DIR);

  for (const { filePath, module } of modules) {
    if (!module?.data?.name || typeof module.execute !== 'function') {
      client.logger.warn(`Skipped invalid slash command file: ${filePath}`);
      continue;
    }
    client.commands.set(module.data.name, module);
  }

  client.logger.info(`Loaded ${client.commands.size} slash command(s).`);
}

/**
 * Dispatches a ChatInputCommandInteraction: resolves the command, enforces
 * its permission requirements and cooldown, then executes it. All failures
 * (unknown command aside) are surfaced to the user via handleInteractionError
 * rather than left to crash the interactionCreate event.
 *
 * @param {import('../structures/BotClient')} client
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 */
async function handleSlashCommand(client, interaction) {
  const command = client.commands.get(interaction.commandName);
  if (!command) {
    client.logger.warn(`Received unknown slash command: ${interaction.commandName}`);
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
    `slash:${command.data.name}`,
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

module.exports = { loadCommands, handleSlashCommand };
