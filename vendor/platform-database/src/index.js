const pool = require('./pool');

/**
 * Thin query wrapper. Feature-specific query builders live under
 * `src/queries/<domain>.js` and require this module — keep this file itself
 * free of domain logic.
 */
function query(text, params) {
  return pool.query(text, params);
}

module.exports = {
  pool,
  query,
  guildSettings: require('./queries/guildSettings'),
};
