/**
 * Base shape shared by button, modal, and select-menu modules
 * (`components/buttons/**`, `components/modals/**`, `components/selects/**`).
 *
 * `customId` may be either:
 *  - a `string` for an exact match (e.g. a static "confirm" button), or
 *  - a `RegExp` for dynamic IDs (e.g. `/^delete_\d+$/` to match `delete_123`
 *    style IDs that encode data). See handlers/buttonHandler.js for how the
 *    match is resolved.
 *
 * @typedef {Object} ComponentModule
 * @property {string|RegExp} customId
 * @property {(interaction: import('discord.js').Interaction, client: import('./BotClient')) => Promise<void>} execute
 */

class Component {
  constructor({ customId, execute }) {
    if (!customId || typeof execute !== 'function') {
      throw new Error('Component requires both "customId" and "execute".');
    }
    this.customId = customId;
    this.execute = execute;
  }
}

module.exports = Component;
