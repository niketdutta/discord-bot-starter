const { validateEnv } = require('../src/config');
const { deployCommands } = require('../src/services/commandDeployer');

validateEnv();

deployCommands().catch((err) => {
  console.error('Failed to deploy commands:', err);
  process.exit(1);
});
