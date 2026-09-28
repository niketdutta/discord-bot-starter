/**
 * Bot-facing database entry point. Re-exports the shared pool/query helper
 * and is where bot-specific query modules (guild settings, moderation logs,
 * etc.) get pulled together for commands/services to import.
 */
module.exports = require('@platform/database');
