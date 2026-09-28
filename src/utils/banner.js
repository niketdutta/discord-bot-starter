const os = require('node:os');

const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const CYAN = '\x1b[36m';
const GREEN = '\x1b[32m';

/**
 * Prints a short, readable startup summary once the client is ready —
 * mainly so "is it actually up, and what did it load" is answerable at a
 * glance instead of scrolling through boot logs.
 *
 * @param {import('../structures/BotClient')} client
 */
function printStartupBanner(client) {
  const lines = [
    `${BOLD}${GREEN}●${RESET} ${BOLD}${client.user.tag}${RESET} is online`,
    `${DIM}├─${RESET} guilds:   ${CYAN}${client.guilds.cache.size}${RESET}`,
    `${DIM}├─${RESET} commands: ${CYAN}${client.commands.size} slash, ${client.prefixCommands.size} prefix, ${client.contextMenus.size} context${RESET}`,
    `${DIM}├─${RESET} components: ${CYAN}${client.buttons.size} buttons, ${client.modals.size} modals, ${client.selectMenus.size} selects${RESET}`,
    `${DIM}├─${RESET} env:      ${CYAN}${process.env.NODE_ENV || 'development'}${RESET}`,
    `${DIM}└─${RESET} node:     ${CYAN}${process.version} (${os.platform()})${RESET}`,
  ];

  // Plain console.log rather than the pino logger — this is a one-shot
  // human-facing summary, not a structured log line worth shipping to log
  // aggregation.
  console.log(`\n${lines.join('\n')}\n`);
}

module.exports = { printStartupBanner };
