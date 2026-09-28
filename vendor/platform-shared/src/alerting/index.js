/**
 * Best-effort crash notification via a Discord webhook — the zero-signup
 * alternative to a full APM (Sentry, etc.). If `webhookUrl` is unset the
 * call is a silent no-op, and any failure to reach Discord itself is
 * swallowed: alerting must never throw from inside a crash handler.
 *
 * @param {Object} options
 * @param {string|null|undefined} options.webhookUrl
 * @param {string} options.service - e.g. "bot", "backend".
 * @param {string} options.title - e.g. "Uncaught exception".
 * @param {unknown} options.error
 */
async function sendCrashAlert({ webhookUrl, service, title, error }) {
  if (!webhookUrl) return;

  const detail = error instanceof Error ? (error.stack ?? error.message) : String(error);

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [
          {
            title: `🚨 [${service}] ${title}`,
            description: `\`\`\`\n${detail.slice(0, 1900)}\n\`\`\``,
            color: 0xed4245,
            timestamp: new Date().toISOString(),
          },
        ],
      }),
    });
  } catch {
    // The webhook itself being down shouldn't compound the outage we're trying to report.
  }
}

module.exports = { sendCrashAlert };
