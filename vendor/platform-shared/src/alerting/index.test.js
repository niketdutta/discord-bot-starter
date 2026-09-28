const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { sendCrashAlert } = require('./index');

function startServer(handler) {
  return new Promise((resolve) => {
    const server = http.createServer(handler);
    server.listen(0, () => resolve(server));
  });
}

test('sendCrashAlert posts a Discord embed payload with the service/title/error', async () => {
  let received;
  const server = await startServer((req, res) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      received = JSON.parse(body);
      res.writeHead(204).end();
    });
  });

  try {
    const { port } = server.address();
    await sendCrashAlert({
      webhookUrl: `http://127.0.0.1:${port}/webhook`,
      service: 'backend',
      title: 'Uncaught exception',
      error: new Error('boom'),
    });

    assert.equal(received.embeds.length, 1);
    assert.match(received.embeds[0].title, /backend.*Uncaught exception/);
    assert.match(received.embeds[0].description, /boom/);
  } finally {
    server.close();
  }
});

test('sendCrashAlert is a silent no-op with no webhookUrl', async () => {
  await assert.doesNotReject(() => sendCrashAlert({ webhookUrl: null, service: 'bot', title: 'x', error: new Error('x') }));
});

test('sendCrashAlert swallows failures reaching an unreachable webhook', async () => {
  await assert.doesNotReject(() =>
    sendCrashAlert({
      webhookUrl: 'http://127.0.0.1:1/webhook',
      service: 'bot',
      title: 'x',
      error: new Error('x'),
    }),
  );
});
