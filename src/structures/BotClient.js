const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { createLogger } = require('@platform/shared');
const CooldownManager = require('../managers/CooldownManager');
const { setupProcessErrorHandlers } = require('../utils/errorHandler');
const { loadCommands } = require('../handlers/commandHandler');
const { loadPrefixCommands } = require('../handlers/prefixCommandHandler');
const { loadContextMenus } = require('../handlers/contextMenuHandler');
const { loadButtons } = require('../handlers/buttonHandler');
const { loadModals } = require('../handlers/modalHandler');
const { loadSelectMenus } = require('../handlers/selectMenuHandler');
const { loadEvents } = require('../handlers/eventHandler');

/**
 * Extended discord.js Client that carries every module collection (slash
 * commands, prefix commands, context menus, buttons, modals, select menus)
 * plus a cooldown manager and logger, so any module reaches them via
 * `client` instead of importing globals or singletons.
 */
class BotClient extends Client {
  constructor() {
    super({
      // Minimal intent set for a slash-command bot. Add more as you build
      // features that need them — each one also needs enabling in the
      // Discord Developer Portal if it's privileged:
      //   GuildMembers        -> welcome messages, member info lookups
      //   GuildModeration     -> ban/unban events
      //   GuildVoiceStates    -> voice join/leave/move events
      //   GuildMessageReactions -> reaction roles, reaction-based features
      //   GuildInvites, GuildEmojisAndStickers, GuildWebhooks -> audit-log-style logging
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        // Required to read message content for the prefix command handler.
        // Must also be enabled in the Discord Developer Portal under
        // Bot -> Privileged Gateway Intents -> Message Content Intent.
        GatewayIntentBits.MessageContent,
      ],
    });

    // Populated by the load* calls in start() below.
    this.commands = new Collection();
    this.prefixCommands = new Collection();
    this.prefixAliases = new Collection();
    this.contextMenus = new Collection();
    this.buttons = new Collection();
    this.modals = new Collection();
    this.selectMenus = new Collection();

    this.cooldowns = new CooldownManager();
    this.logger = createLogger('bot');
  }

  /**
   * Wires up error safety nets, loads every module tree, then logs in.
   * Events (including interactionCreate/messageCreate) are loaded last so
   * they only start firing once every collection they read from is
   * already populated.
   *
   * @param {string} token
   */
  async start(token) {
    setupProcessErrorHandlers(this);

    loadCommands(this);
    loadPrefixCommands(this);
    loadContextMenus(this);
    loadButtons(this);
    loadModals(this);
    loadSelectMenus(this);
    loadEvents(this);

    await this.login(token);
  }
}

module.exports = BotClient;
