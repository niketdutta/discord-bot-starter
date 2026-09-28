const { REST, Routes } = require('discord.js');
const { config, validateEnv } = require('../src/config');

/**
 * Wipes every globally-registered application command. Global overwrite
 * (PUT with an empty array) removes commands Discord shows in every guild
 * the bot is in — useful for clearing out leftovers from a Discord
 * application that was previously used for a different bot/codebase, which
 * a guild-scoped `npm run deploy` never touches (see
 * src/services/commandDeployer.js).
 */
async function clearGlobalCommands() {
  validateEnv();

  const rest = new REST().setToken(config.discord.token);
  await rest.put(Routes.applicationCommands(config.discord.clientId), { body: [] });

  console.log('Cleared all global application commands.');
}

clearGlobalCommands().catch((err) => {
  console.error('Failed to clear global commands:', err);
  process.exit(1);
});
