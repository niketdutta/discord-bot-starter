const { Events, ActivityType } = require('discord.js');
const { printStartupBanner } = require('../../utils/banner');

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute: async (client) => {
    client.logger.info(`Logged in as ${client.user.tag} (${client.user.id}).`);
    printStartupBanner(client);

    client.user.setActivity('/ping', { type: ActivityType.Playing });
  },
};
