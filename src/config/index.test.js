const test = require('node:test');
const assert = require('node:assert/strict');

const REQUIRED = ['DISCORD_TOKEN', 'DISCORD_CLIENT_ID', 'DATABASE_URL'];

function withEnv(overrides, fn) {
  const original = Object.fromEntries(REQUIRED.map((key) => [key, process.env[key]]));
  for (const key of REQUIRED) process.env[key] = 'test-value';
  Object.assign(process.env, overrides);
  try {
    fn();
  } finally {
    for (const key of REQUIRED) {
      if (original[key] === undefined) delete process.env[key];
      else process.env[key] = original[key];
    }
  }
}

// validateEnv reads process.env live on every call, so mutating env around
// each call is enough — no need to bust the require cache.
const { validateEnv } = require('./index');

test('validateEnv passes when every required var is set', () => {
  withEnv({}, () => {
    assert.doesNotThrow(() => validateEnv());
  });
});

test('validateEnv throws when a required var is missing', () => {
  withEnv({ DATABASE_URL: '' }, () => {
    assert.throws(() => validateEnv(), /Missing required environment variables/);
  });
});
