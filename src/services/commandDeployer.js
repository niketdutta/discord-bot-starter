const path = require('node:path');
const { REST, Routes } = require('discord.js');
const { loadModules } = require('../utils/fileLoader');
const { config } = require('../config');

const SLASH_COMMANDS_DIR = path.join(__dirname, '..', 'commands', 'slash');
const CONTEXT_MENUS_DIR = path.join(__dirname, '..', 'commands', 'context');

/**
 * Registers every slash + context menu command currently on disk with
 * Discord via REST, fully replacing whatever was previously registered.
 * Discord's bulk overwrite (PUT) semantics mean any command that existed
 * before but isn't in this payload — renamed, deleted, or from an older
 * build — is removed automatically, so stale commands never linger.
 *
 * Called on every bot startup (see index.js) so the registered command set
 * always matches what's actually loaded; also runnable standalone via
 * `npm run deploy` (scripts/deploy-commands.js) when you want to push a
 * command change without restarting the bot.
 *
 * Registers to a single guild (near-instant) when DISCORD_GUILD_ID is set,
 * otherwise registers globally (can take up to an hour to propagate).
 *
 * @param {{ info: (msg: string) => void }} [logger] - Defaults to console for standalone script usage.
 */
async function deployCommands(logger = console) {
  const commandsData = [...loadModules(SLASH_COMMANDS_DIR), ...loadModules(CONTEXT_MENUS_DIR)]
    .map(({ module }) => module?.data)
    .filter(Boolean)
    .map((data) => (typeof data.toJSON === 'function' ? data.toJSON() : data));

  const rest = new REST().setToken(config.discord.token);

  const route = config.discord.guildId
    ? Routes.applicationGuildCommands(config.discord.clientId, config.discord.guildId)
    : Routes.applicationCommands(config.discord.clientId);

  const result = await rest.put(route, { body: commandsData });

  logger.info(
    `Registered ${result.length} application command(s) ${
      config.discord.guildId ? `to guild ${config.discord.guildId}` : 'globally'
    }, replacing any previous set.`,
  );

  return result;
}

module.exports = { deployCommands };
