const fs = require('node:fs');
const path = require('node:path');

/**
 * Recursively collects every `.js` file path under `dir`, so commands/events/
 * components can be organized into arbitrary sub-folders (e.g. grouping
 * slash commands by category) without the loaders needing to know about it.
 *
 * @param {string} dir
 * @returns {string[]} Absolute file paths.
 */
function walk(dir) {
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(fullPath);
    return entry.name.endsWith('.js') && !entry.name.endsWith('.test.js') ? [fullPath] : [];
  });
}

/**
 * Dynamic module loader shared by every handler (commands, events, buttons,
 * modals, select menus, context menus). Centralizing `require()` + the
 * recursive walk here means each handler only has to worry about validating
 * and registering the shape it expects — not rediscovering files on disk.
 *
 * @param {string} dir - Directory to scan.
 * @returns {{ filePath: string, module: unknown }[]}
 */
function loadModules(dir) {
  return walk(dir).map((filePath) => ({
    filePath,
    module: require(filePath),
  }));
}

module.exports = { loadModules };
