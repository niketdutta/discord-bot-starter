const { ContainerBuilder, SeparatorSpacingSize, ButtonBuilder, ButtonStyle } = require('discord.js');
const { ACCENT_COLOR } = require('../constants');

const REFRESH_BUTTON_ID = 'ping_refresh';

/**
 * Builds the Components V2 card shown by /ping (see commands/slash/ping.js)
 * and re-rendered in place by its refresh button (see
 * components/buttons/pingRefresh.js) — kept as a shared builder so both
 * call sites stay in sync instead of duplicating the layout.
 *
 * @param {import('../structures/BotClient')} client
 * @param {number|null} roundtripMs - null while the initial reply is still in flight.
 */
function buildPingContainer(client, roundtripMs) {
  return new ContainerBuilder()
    .setAccentColor(ACCENT_COLOR)
    .addSectionComponents((section) =>
      section
        .addTextDisplayComponents((text) => text.setContent('### 🏓 Pong!'))
        .setThumbnailAccessory((thumbnail) => thumbnail.setURL(client.user.displayAvatarURL())),
    )
    .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
    .addTextDisplayComponents((text) =>
      text.setContent(
        [
          `**Websocket:** ${client.ws.ping}ms`,
          `**Roundtrip:** ${roundtripMs === null ? 'Calculating…' : `${roundtripMs}ms`}`,
        ].join('\n'),
      ),
    )
    .addActionRowComponents((row) =>
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(REFRESH_BUTTON_ID)
          .setLabel('Refresh')
          .setEmoji('🔄')
          .setStyle(ButtonStyle.Secondary),
      ),
    );
}

module.exports = { buildPingContainer, REFRESH_BUTTON_ID };
