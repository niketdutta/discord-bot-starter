/**
 * Base shape every legacy/prefix command module should export from
 * `commands/prefix/**`.
 *
 * @typedef {Object} PrefixCommandModule
 * @property {string} name
 * @property {string[]} [aliases]
 * @property {(message: import('discord.js').Message, args: string[], client: import('./BotClient')) => Promise<void>} execute
 * @property {number} [cooldown] - Seconds between uses per user.
 * @property {import('./Command').CommandPermissions} [permissions]
 */

class PrefixCommand {
  constructor({ name, execute, aliases = [], cooldown = 0, permissions = {} }) {
    if (!name || typeof execute !== 'function') {
      throw new Error('PrefixCommand requires both "name" and "execute".');
    }
    this.name = name;
    this.execute = execute;
    this.aliases = aliases;
    this.cooldown = cooldown;
    this.permissions = permissions;
  }
}

module.exports = PrefixCommand;
