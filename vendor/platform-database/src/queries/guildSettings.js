const pool = require('../pool');

// Requires ../pool directly (see queries/guildSettings.js for why ../index
// would be circular here — index.js requires this file to build its export).
function query(text, params) {
  return pool.query(text, params);
}

/**
 * Fetches a guild's settings row, or a set of defaults if it's never been
 * configured — callers shouldn't have to special-case "row doesn't exist
 * yet" everywhere they read settings.
 *
 * @param {string} guildId
 */
async function getByGuildId(guildId) {
  const { rows } = await query('SELECT * FROM guild_settings WHERE guild_id = $1', [guildId]);
  return rows[0] || { guild_id: guildId, prefix: null };
}

/**
 * Inserts or updates a guild's settings row.
 *
 * @param {string} guildId
 * @param {Object} fields
 * @param {string|null} [fields.prefix]
 */
async function upsert(guildId, { prefix } = {}) {
  const { rows } = await query(
    `INSERT INTO guild_settings (guild_id, prefix, updated_at)
     VALUES ($1, $2, now())
     ON CONFLICT (guild_id) DO UPDATE SET
       prefix = EXCLUDED.prefix,
       updated_at = now()
     RETURNING *`,
    [guildId, prefix],
  );
  return rows[0];
}

module.exports = { getByGuildId, upsert };
