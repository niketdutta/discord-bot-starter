const { Events } = require('discord.js');
const { handlePrefixCommand } = require('../../handlers/prefixCommandHandler');

module.exports = {
  name: Events.MessageCreate,
  execute: async (client, message) => {
    await handlePrefixCommand(client, message);
  },
};
