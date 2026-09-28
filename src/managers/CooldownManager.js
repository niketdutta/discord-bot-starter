const { Collection } = require('discord.js');

/**
 * Tracks per-user cooldowns keyed by an arbitrary string (typically a
 * command name, prefixed to keep slash/prefix/context namespaces separate —
 * see handlers/*Handler.js). Backed by in-memory Collections since cooldowns
 * are process-local and short-lived; nothing here needs to survive a restart.
 */
class CooldownManager {
  constructor() {
    /** @type {Collection<string, Collection<string, number>>} */
    this.buckets = new Collection();
  }

  /**
   * Checks whether `userId` is on cooldown for `key`, and if not, starts a
   * new cooldown window. Combining the check + set into one call keeps
   * call sites simple and avoids a race where two calls in flight both see
   * "not on cooldown".
   *
   * @param {string} key
   * @param {string} userId
   * @param {number} durationSeconds
   * @returns {{ onCooldown: boolean, remainingSeconds: number }}
   */
  check(key, userId, durationSeconds) {
    if (!durationSeconds) return { onCooldown: false, remainingSeconds: 0 };

    if (!this.buckets.has(key)) {
      this.buckets.set(key, new Collection());
    }

    const timestamps = this.buckets.get(key);
    const now = Date.now();
    const expiresAt = timestamps.get(userId);

    if (expiresAt && now < expiresAt) {
      return { onCooldown: true, remainingSeconds: (expiresAt - now) / 1000 };
    }

    timestamps.set(userId, now + durationSeconds * 1000);
    // Self-cleaning: drop the entry once it expires instead of growing forever.
    setTimeout(() => timestamps.delete(userId), durationSeconds * 1000).unref();

    return { onCooldown: false, remainingSeconds: 0 };
  }
}

module.exports = CooldownManager;
