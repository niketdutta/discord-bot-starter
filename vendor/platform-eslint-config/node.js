const base = require('./index');

/**
 * Preset for a pure Node.js service. Identical to the base
 * preset today; kept as a separate entry point so service-specific rules
 * can be layered in later without touching consumers.
 */
module.exports = [...base];
