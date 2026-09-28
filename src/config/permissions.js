/**
 * Ordered permission tiers used by the permission system (see
 * managers/PermissionManager.js). A command declares the *minimum* level a
 * member must have via `permissions.level`; higher tiers automatically
 * satisfy lower requirements because the values are ordered ascending.
 *
 * This enum intentionally stays generic (no guild-specific roles) — feature
 * work can extend `PermissionManager.resolveMemberLevel` to layer in
 * database-backed staff roles without touching this contract.
 */
const PermissionLevel = Object.freeze({
  USER: 0,
  MODERATOR: 1,
  ADMIN: 2,
  DEVELOPER: 3,
  OWNER: 4,
});

module.exports = { PermissionLevel };
