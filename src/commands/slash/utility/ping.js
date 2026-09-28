const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { buildPingContainer } = require('../../../services/pingCard');

module.exports = {
  data: new SlashCommandBuilder()
  .setName('ping')
  .setDescription("Check the bot's latency."),
  category: 'Utility',
  cooldown: 5,
  execute: async (interaction, client) => {
    await interaction.reply({
      components: [buildPingContainer(client, null)],
      flags: MessageFlags.IsComponentsV2,
    });

    const sent = await interaction.fetchReply();
    const roundtripMs = sent.createdTimestamp - interaction.createdTimestamp;

    await interaction.editReply({
      components: [buildPingContainer(client, roundtripMs)],
      flags: MessageFlags.IsComponentsV2,
    });
  },
};
