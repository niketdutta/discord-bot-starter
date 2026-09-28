/**
 * Base shape every slash command module should export from
 * `commands/slash/**`. Command files export a plain object matching this
 * contract; this class only documents/validates the shape at load time
 * (see handlers/commandHandler.js), it holds no behavior of its own.
 *
 * @typedef {Object} CommandPermissions
 * @property {number} [level] - Minimum PermissionLevel (config/permissions.js) required.
 * @property {boolean} [ownerOnly] - Restrict to config.owners regardless of level.
 * @property {import('discord.js').PermissionResolvable[]} [userPermissions] - Discord permissions the invoking member must have.
 * @property {import('discord.js').PermissionResolvable[]} [botPermissions] - Discord permissions the bot must have in-channel.
 *
 * @typedef {Object} CommandModule
 * @property {import('discord.js').SlashCommandBuilder} data
 * @property {(interaction: import('discord.js').ChatInputCommandInteraction, client: import('./BotClient')) => Promise<void>} execute
 * @property {(interaction: import('discord.js').AutocompleteInteraction, client: import('./BotClient')) => Promise<void>} [autocomplete]
 * @property {number} [cooldown] - Seconds between uses per user.
 * @property {CommandPermissions} [permissions]
 */

class Command {
  constructor({ data, execute, autocomplete, cooldown = 0, permissions = {} }) {
    if (!data || typeof execute !== 'function') {
      throw new Error('Command requires both "data" and "execute".');
    }
    this.data = data;
    this.execute = execute;
    this.autocomplete = autocomplete;
    this.cooldown = cooldown;
    this.permissions = permissions;
  }
}

module.exports = Command;
