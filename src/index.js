const { config, validateEnv } = require('./config');

// Initialized before any other module loads so Sentry's auto-instrumentation
// (uncaught exception/rejection hooks) is in place from the very first tick.
// Optional — no-op with an empty DSN, same optionality as errorAlertWebhookUrl.
if (config.sentryDsn) {
  const Sentry = require('@sentry/node');
  Sentry.init({ dsn: config.sentryDsn, environment: config.env, tracesSampleRate: 0 });
}

const BotClient = require('./structures/BotClient');
const { deployCommands } = require('./services/commandDeployer');

async function main() {
  validateEnv();

  const client = new BotClient();

  // Keeps Discord's registered command set in sync with what's on disk on
  // every boot — renamed/removed commands are cleared automatically via
  // Discord's bulk overwrite semantics (see services/commandDeployer.js).
  // Gated behind AUTO_DEPLOY_COMMANDS (see config/index.js) since global
  // command updates are rate-limited; deploy deliberately via `npm run
  // deploy` once running global commands across many guilds instead.
  if (config.autoDeployCommands) {
    await deployCommands(client.logger);
  }

  await client.start(config.discord.token);
}

main().catch((err) => {
  console.error('Fatal error while starting the bot:', err);
  process.exit(1);
});
