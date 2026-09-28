/**
 * Seed runner entry point. Add seed modules to this directory and require
 * them here in the order they should execute.
 */
async function run() {
  console.log('No seeds registered yet.');
  process.exit(0);
}

run().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
