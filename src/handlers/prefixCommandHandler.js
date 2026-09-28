const path = require('node:path');
const { loadModules } = require('../utils/fileLoader');
const { checkPermissions } = require('../managers/PermissionManager');
const { config } = require('../config');

const PREFIX_COMMANDS_DIR = path.join(__dirname, '..', 'commands', 'prefix');

/**
 * Recursively loads every module under `commands/prefix` (see
 * structures/PrefixCommand.js) into `client.prefixCommands`, and indexes any
 * declared aliases into `client.prefixAliases` (alias -> canonical name).
 *
 * @param {import('../structures/BotClient')} client
 */
function loadPrefixCommands(client) {
  const modules = loadModules(PREFIX_COMMANDS_DIR);

  for (const { filePath, module } of modules) {
    if (!module?.name || typeof module.execute !== 'function') {
      client.logger.warn(`Skipped invalid prefix command file: ${filePath}`);
      continue;
    }

    client.prefixCommands.set(module.name, module);
    for (const alias of module.aliases || []) {
      client.prefixAliases.set(alias, module.name);
    }
  }

  client.logger.info(`Loaded ${client.prefixCommands.size} prefix command(s).`);
}

/**
 * Parses an incoming message for the configured prefix, resolves the
 * command (by name or alias), enforces permissions/cooldown, and executes.
 * Silently ignores bot authors, DMs, and messages that don't match the
 * prefix — this is the hot path for every message the bot sees.
 *
 * @param {import('../structures/BotClient')} client
 * @param {import('discord.js').Message} message
 */
async function handlePrefixCommand(client, message) {
  if (message.author.bot || !message.guild) return;
  if (!message.content.startsWith(config.defaultPrefix)) return;

  const args = message.content.slice(config.defaultPrefix.length).trim().split(/\s+/);
  const commandName = args.shift()?.toLowerCase();
  if (!commandName) return;

  const resolvedName = client.prefixCommands.has(commandName)
    ? commandName
    : client.prefixAliases.get(commandName);
  const command = resolvedName ? client.prefixCommands.get(resolvedName) : undefined;
  if (!command) return;

  const { allowed, reason } = checkPermissions({
    member: message.member,
    channel: message.channel,
    command,
  });
  if (!allowed) {
    await message.reply(reason);
    return;
  }

  const cooldown = client.cooldowns.check(`prefix:${command.name}`, message.author.id, command.cooldown);
  if (cooldown.onCooldown) {
    await message.reply(
      `Please wait ${cooldown.remainingSeconds.toFixed(1)}s before using this command again.`,
    );
    return;
  }

  try {
    await command.execute(message, args, client);
  } catch (error) {
    client.logger.error({ err: error, command: command.name }, 'Prefix command execution failed');
    await message.reply('Something went wrong while executing this command.').catch(() => {});
  }
}

module.exports = { loadPrefixCommands, handlePrefixCommand };
