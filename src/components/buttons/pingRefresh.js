const { MessageFlags } = require('discord.js');
const { buildPingContainer, REFRESH_BUTTON_ID } = require('../../services/pingCard');

module.exports = {
  customId: REFRESH_BUTTON_ID,
  execute: async (interaction, client) => {
    await interaction.deferUpdate();
    const roundtripMs = Date.now() - interaction.createdTimestamp;

    await interaction.editReply({
      components: [buildPingContainer(client, roundtripMs)],
      flags: MessageFlags.IsComponentsV2,
    });
  },
};
