require('dotenv').config();

/**
 * Validates required environment variables up front so the process fails
 * fast on misconfiguration instead of crashing later inside an event handler.
 */
const REQUIRED_ENV_VARS = ['DISCORD_TOKEN', 'DISCORD_CLIENT_ID', 'DATABASE_URL'];

function validateEnv() {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

/**
 * Parses a comma-separated env var into a clean array of IDs, e.g.
 * "123, 456" -> ["123", "456"]. Used for BOT_OWNERS.
 */
function parseIdList(value) {
  return (value || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
}

const config = {
  env: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  discord: {
    token: process.env.DISCORD_TOKEN,
    clientId: process.env.DISCORD_CLIENT_ID,
    // Set this during development for instant, guild-scoped command
    // registration. Leave unset for global commands (can take up to an
    // hour to propagate, but works across every server the bot joins).
    guildId: process.env.DISCORD_GUILD_ID || null,
  },
  // User IDs that bypass the permission system entirely (see managers/PermissionManager.js).
  owners: parseIdList(process.env.BOT_OWNERS),
  // Prefix used by the message-based command handler (see handlers/prefixCommandHandler.js).
  defaultPrefix: process.env.DEFAULT_PREFIX || '!',
  // Whether to redeploy application commands (see services/commandDeployer.js)
  // on every boot. Safe to leave on for guild-scoped dev deploys (instant,
  // no meaningful rate limit); turn off once running global commands across
  // many guilds, since global command updates are capped at 200/day per
  // application and command definitions change far less often than the
  // process restarts — deploy deliberately instead via `npm run deploy`.
  autoDeployCommands: process.env.AUTO_DEPLOY_COMMANDS === 'true',
  // Optional: Discord webhook URL that gets a message on an uncaught
  // exception / unhandled rejection (see utils/errorHandler.js). Unset just
  // means you find out about a crash from the console/logs instead.
  errorAlertWebhookUrl: process.env.ERROR_ALERT_WEBHOOK_URL || null,
  // Optional: Sentry DSN for error/performance monitoring (see
  // utils/errorHandler.js and index.js). Unset just skips Sentry.init().
  sentryDsn: process.env.SENTRY_DSN || null,
};

module.exports = { config, validateEnv };
