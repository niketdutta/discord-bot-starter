/* eslint-disable camelcase */

exports.shorthands = undefined;

/**
 * Minimal example of the "one row per guild" settings pattern — nearly
 * every Discord bot ends up needing per-server config eventually. Add
 * columns here as your bot grows (e.g. a welcome channel, mod-log channel,
 * feature toggles) and extend src/queries/guildSettings.js to match.
 */
exports.up = (pgm) => {
  pgm.createTable('guild_settings', {
    guild_id: { type: 'text', primaryKey: true },
    prefix: { type: 'text' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('guild_settings');
};
