const { Events } = require('discord.js');
const { handleSlashCommand } = require('../../handlers/commandHandler');
const { handleContextMenuInteraction } = require('../../handlers/contextMenuHandler');
const { handleAutocompleteInteraction } = require('../../handlers/autocompleteHandler');
const { handleButtonInteraction } = require('../../handlers/buttonHandler');
const { handleModalInteraction } = require('../../handlers/modalHandler');
const { handleSelectMenuInteraction } = require('../../handlers/selectMenuHandler');

/**
 * Single entry point for every interaction Discord sends. Kept as a thin
 * router — each branch delegates to its own handler module, which owns
 * validation, cooldown/permission checks, and error handling for that
 * interaction type. Order matters: autocomplete must be checked before
 * chat input command (both originate from a slash command) is not an issue
 * here since they're mutually exclusive interaction types, but the checks
 * are still ordered from most to least specific for readability.
 */
module.exports = {
  name: Events.InteractionCreate,
  execute: async (client, interaction) => {
    if (interaction.isChatInputCommand()) {
      await handleSlashCommand(client, interaction);
    } else if (interaction.isContextMenuCommand()) {
      await handleContextMenuInteraction(client, interaction);
    } else if (interaction.isAutocomplete()) {
      await handleAutocompleteInteraction(client, interaction);
    } else if (interaction.isButton()) {
      await handleButtonInteraction(client, interaction);
    } else if (interaction.isModalSubmit()) {
      await handleModalInteraction(client, interaction);
    } else if (interaction.isAnySelectMenu()) {
      await handleSelectMenuInteraction(client, interaction);
    }
  },
};
