/**
 * Base shape every context menu command module should export from
 * `commands/context/**`. `data` must be built with
 * `new ContextMenuCommandBuilder().setType(ApplicationCommandType.User | .Message)`.
 *
 * @typedef {Object} ContextMenuCommandModule
 * @property {import('discord.js').ContextMenuCommandBuilder} data
 * @property {(interaction: import('discord.js').ContextMenuCommandInteraction, client: import('./BotClient')) => Promise<void>} execute
 * @property {number} [cooldown]
 * @property {import('./Command').CommandPermissions} [permissions]
 */

class ContextMenuCommand {
  constructor({ data, execute, cooldown = 0, permissions = {} }) {
    if (!data || typeof execute !== 'function') {
      throw new Error('ContextMenuCommand requires both "data" and "execute".');
    }
    this.data = data;
    this.execute = execute;
    this.cooldown = cooldown;
    this.permissions = permissions;
  }
}

module.exports = ContextMenuCommand;
