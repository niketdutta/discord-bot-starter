const baseConfig = require('@platform/eslint-config/node');

module.exports = [...baseConfig, { ignores: ['node_modules/**'] }];
