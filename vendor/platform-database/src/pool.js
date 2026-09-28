const { Pool } = require('pg');

/**
 * Single shared connection pool. Both the bot and the backend import this
 * module so they reuse one pooled connection set per process rather than
 * each opening their own.
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: Number(process.env.DATABASE_POOL_MAX || 10),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  // A background/idle client crashed — surface it instead of crashing the process.
  console.error('Unexpected PostgreSQL pool error', err);
});

module.exports = pool;
