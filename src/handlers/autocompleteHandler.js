/**
 * Autocomplete has no dedicated command tree of its own — it's optional
 * behavior attached to a slash command's `autocomplete` export (see
 * structures/Command.js), so this handler only dispatches; loading already
 * happened in handlers/commandHandler.js.
 *
 * @param {import('../structures/BotClient')} client
 * @param {import('discord.js').AutocompleteInteraction} interaction
 */
async function handleAutocompleteInteraction(client, interaction) {
  const command = client.commands.get(interaction.commandName);
  if (!command || typeof command.autocomplete !== 'function') return;

  try {
    await command.autocomplete(interaction, client);
  } catch (error) {
    // Autocomplete interactions can't be replied to like normal ones (no
    // reply/followUp) — logging is the only meaningful recovery here.
    client.logger.error(
      { err: error, commandName: interaction.commandName },
      'Autocomplete execution failed',
    );
  }
}

module.exports = { handleAutocompleteInteraction };
