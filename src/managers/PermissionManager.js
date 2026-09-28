const { PermissionsBitField } = require('discord.js');
const { config } = require('../config');
const { PermissionLevel } = require('../config/permissions');

/**
 * Resolves a guild member's permission tier. Config-declared bot owners
 * always resolve to OWNER; server Administrators resolve to ADMIN; everyone
 * else is a plain USER. This is deliberately minimal — a database-backed
 * staff-role system can extend this function later without changing the
 * `checkPermissions` contract below.
 *
 * @param {import('discord.js').GuildMember | null} member
 * @returns {number} One of PermissionLevel's values.
 */
function resolveMemberLevel(member) {
  if (!member) return PermissionLevel.USER;
  if (config.owners.includes(member.id)) return PermissionLevel.OWNER;
  if (member.permissions?.has(PermissionsBitField.Flags.Administrator)) return PermissionLevel.ADMIN;
  return PermissionLevel.USER;
}

/**
 * Validates a command/component's `permissions` requirements (see
 * structures/Command.js) against the invoking member and the bot's own
 * permissions in the channel the interaction/message happened in.
 *
 * @param {Object} params
 * @param {import('discord.js').GuildMember | null} params.member
 * @param {import('discord.js').GuildTextBasedChannel | null} params.channel
 * @param {{ permissions?: import('../structures/Command').CommandPermissions }} params.command
 * @returns {{ allowed: boolean, reason?: string }}
 */
function checkPermissions({ member, channel, command }) {
  const requirements = command.permissions || {};

  if (requirements.ownerOnly && !config.owners.includes(member?.id)) {
    return { allowed: false, reason: 'This command can only be used by the bot owner.' };
  }

  if (requirements.level !== undefined) {
    const level = resolveMemberLevel(member);
    if (level < requirements.level) {
      return { allowed: false, reason: 'You do not have permission to use this command.' };
    }
  }

  if (requirements.userPermissions?.length) {
    const missing = member?.permissions
      ? requirements.userPermissions.filter((perm) => !member.permissions.has(perm))
      : requirements.userPermissions;

    if (missing.length > 0) {
      return {
        allowed: false,
        reason: `You are missing the following permissions: ${missing.join(', ')}`,
      };
    }
  }

  if (requirements.botPermissions?.length) {
    const botMember = channel?.guild?.members?.me;
    const missing = botMember
      ? requirements.botPermissions.filter((perm) => !botMember.permissionsIn(channel).has(perm))
      : requirements.botPermissions;

    if (missing.length > 0) {
      return {
        allowed: false,
        reason: `I am missing the following permissions: ${missing.join(', ')}`,
      };
    }
  }

  return { allowed: true };
}

module.exports = { resolveMemberLevel, checkPermissions };
