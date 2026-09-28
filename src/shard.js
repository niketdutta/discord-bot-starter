const { ShardingManager } = require('discord.js');
const path = require('node:path');
const { config, validateEnv } = require('./config');

validateEnv();

// discord.js's built-in process-per-shard manager: 'auto' asks Discord for
// its recommended shard count and spawns one child process per shard,
// respawning any that crash. Each child is just src/index.js — discord.js
// picks up its shard id/count from the env vars this manager sets, so
// nothing else in the bot needs to know sharding exists.
const manager = new ShardingManager(path.join(__dirname, 'index.js'), {
  token: config.discord.token,
  totalShards: 'auto',
  respawn: true,
});

manager.on('shardCreate', (shard) => {
  console.log(`Launched shard ${shard.id}`);
});

manager.spawn();
