/**
 * Throw this from a command/component when the failure is expected and the
 * message is safe to show a user verbatim (e.g. "you can't ban yourself",
 * "that role doesn't exist"). Anything else thrown is treated as an
 * internal bug — logged in full, but shown to the user only as a generic
 * "something went wrong" (see utils/errorHandler.js) so internals never leak.
 *
 * @example
 * if (target.id === interaction.user.id) {
 *   throw new BotError("You can't do that to yourself.");
 * }
 */
class BotError extends Error {
  constructor(message) {
    super(message);
    this.name = 'BotError';
  }
}

module.exports = { BotError };
