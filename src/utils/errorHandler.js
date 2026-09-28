const { sendCrashAlert } = require('@platform/shared');
const { config } = require('../config');
const { BotError } = require('./BotError');

/** No-op if Sentry was never initialized (no SENTRY_DSN set) — see index.js. */
function captureException(error) {
  if (!config.sentryDsn) return;
  require('@sentry/node').captureException(error);
}

/**
 * Registers process- and client-level safety nets so an uncaught error in
 * one command/event can't silently crash (or silently hang) the whole bot.
 * Call this once, before login (see structures/BotClient.js).
 *
 * @param {import('../structures/BotClient')} client
 */
function setupProcessErrorHandlers(client) {
  process.on('unhandledRejection', (reason) => {
    client.logger.error({ err: reason }, 'Unhandled promise rejection');
    captureException(reason);
    sendCrashAlert({
      webhookUrl: config.errorAlertWebhookUrl,
      service: 'bot',
      title: 'Unhandled promise rejection',
      error: reason,
    });
  });

  process.on('uncaughtException', (err) => {
    client.logger.error({ err }, 'Uncaught exception');
    captureException(err);
    sendCrashAlert({
      webhookUrl: config.errorAlertWebhookUrl,
      service: 'bot',
      title: 'Uncaught exception',
      error: err,
    });
  });

  client.on('error', (err) => client.logger.error({ err }, 'Discord client error'));
  client.on('warn', (message) => client.logger.warn(message));
}

/**
 * Shared failure path for interaction-based handlers (slash, context menu,
 * button, modal, select menu). Logs the underlying error and replies with a
 * generic message instead of leaking internals — and picks reply vs.
 * followUp based on whether the interaction was already acknowledged.
 *
 * @param {import('discord.js').Interaction} interaction
 * @param {unknown} error
 * @param {import('../structures/BotClient')} client
 */
async function handleInteractionError(interaction, error, client) {
  const isExpected = error instanceof BotError;

  // A BotError is an expected, user-caused failure (see utils/BotError.js) —
  // log it at a lower level and skip Sentry/webhook alerting, since it's not
  // a bug. Anything else is unexpected and gets the full treatment.
  if (isExpected) {
    client.logger.warn(
      { commandName: interaction.commandName, customId: interaction.customId },
      `Expected error: ${error.message}`,
    );
  } else {
    client.logger.error(
      { err: error, commandName: interaction.commandName, customId: interaction.customId },
      'Interaction execution failed',
    );
    captureException(error);
  }

  if (!interaction.isRepliable?.()) return;

  const payload = {
    content: isExpected ? error.message : 'Something went wrong while executing this action.',
    ephemeral: true,
  };

  try {
    if (interaction.deferred || interaction.replied) {
      await interaction.followUp(payload);
    } else {
      await interaction.reply(payload);
    }
  } catch (replyError) {
    client.logger.error({ err: replyError }, 'Failed to send error response to the user');
  }
}

module.exports = { setupProcessErrorHandlers, handleInteractionError };
