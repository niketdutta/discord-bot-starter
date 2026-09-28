/**
 * Base shape every event module should export. Event files under
 * `events/**` should export a plain object matching this contract; this
 * class only documents/enforces the shape, it holds no behavior.
 *
 * @typedef {Object} EventModule
 * @property {string} name - discord.js Client event name.
 * @property {boolean} [once] - Register with `client.once` instead of `client.on`.
 * @property {(...args: unknown[]) => Promise<void>} execute
 */

class Event {
  constructor({ name, execute, once = false }) {
    if (!name || !execute) {
      throw new Error('Event requires both "name" and "execute".');
    }
    this.name = name;
    this.execute = execute;
    this.once = once;
  }
}

module.exports = Event;
