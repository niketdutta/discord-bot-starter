# Discord Bot Starter

[![discord.js](https://img.shields.io/badge/discord.js-v14-5865F2?logo=discord&logoColor=white)](https://discord.js.org)
[![Node](https://img.shields.io/badge/node-%3E%3D18-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A Discord.js v14 bot starter that already has the boring, easy-to-get-wrong
parts done: command/event/component loading, cooldowns, permissions,
structured logging, and crash-safe error handling. Clone it, add your
Discord token and a Postgres URL, and start writing commands — you don't
build another loader/handler system from scratch.

## Table of contents

- [Why this exists](#why-this-exists)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Quick start](#quick-start)
- [Environment variables](#environment-variables)
- [npm scripts](#npm-scripts)
- [Project layout](#project-layout)
- [Adding a command](#adding-a-command)
- [Adding a button, modal, or select menu](#adding-a-button-modal-or-select-menu)
- [Adding an event listener](#adding-an-event-listener)
- [Permissions and cooldowns](#permissions-and-cooldowns)
- [Error handling](#error-handling)
- [Database](#database)
- [Running with Docker](#running-with-docker)
- [Sharding](#sharding)
- [Deploying to production](#deploying-to-production)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Why this exists

Every Discord bot needs the same scaffolding before you can write a single
real feature: a way to load commands from files instead of hand-registering
each one, a dispatcher for buttons/modals/selects, cooldowns, a permission
system, logging that doesn't just `console.log` everything, and error
handling that doesn't crash the whole process the first time a command
throws. Building that from scratch — or copy-pasting it out of an old
project — is time spent on infrastructure instead of your bot's actual
features.

This repo is that scaffolding, already built, tested, and documented. It's
deliberately unopinionated about what your bot *does* — there's exactly one
example command (`/ping`) demonstrating the pattern, no economy system, no
leveling, no moderation suite baked in. You build those on top.

## Features

- **File-based loaders for everything** — drop a file in the right folder
  and it's picked up automatically on boot, no manual registration step:
  slash commands, prefix (`!`) commands, context menu commands, buttons,
  modals, select menus, and discord.js client events.
- **Cooldowns** — per-user, per-command, enforced automatically before
  `execute` ever runs. Declare `cooldown: 5` and you're done.
- **A permission system** — ordered permission tiers (`USER` →
  `MODERATOR` → `ADMIN` → `DEVELOPER` → `OWNER`), plus native Discord
  permission checks for both the invoking member *and* the bot itself, so a
  command can't even attempt an action it doesn't have permission for.
- **Structured, readable logging** — [pino](https://getpino.io) under the
  hood: colorized, human-readable output in development, structured JSON in
  production (so it plugs into any log aggregator). A short startup banner
  prints guild count and how many commands/components loaded, so "is it
  actually up and did everything load" is answerable at a glance.
- **Crash-safe error handling** — global handlers for uncaught exceptions
  and unhandled rejections, per-interaction error boundaries that reply to
  the user instead of leaking a stack trace, a `BotError` class for
  expected/user-caused failures, and optional Sentry + Discord webhook
  crash alerting.
- **A working example, end to end** — `/ping` is a real slash command using
  Discord's Components V2 UI with a working "Refresh" button, so you have a
  complete, correct pattern to copy instead of a "hello world" stub.
- **A database layer, ready to go** — a pooled Postgres connection and a
  migration runner, with one example table showing the "settings per guild"
  pattern almost every bot needs eventually. Skip it entirely if you don't
  need persistence yet (see [Database](#database)).
- **Sharding support** — `npm run start:sharded` spawns one process per
  shard automatically, for when a single process genuinely isn't enough.

## Prerequisites

- **Node.js 18 or newer**
- **A Discord application** — create one at the
  [Discord Developer Portal](https://discord.com/developers/applications),
  add a bot user to it, and copy its token.
- **PostgreSQL** — local, Dockerized, or a managed instance (Supabase,
  Neon, Railway, RDS, etc.). Not required if you strip the database layer
  out (see [Database](#database)).

## Quick start

1. **Clone and install dependencies**
   ```bash
   git clone <this-repo-url> my-bot
   cd my-bot
   npm install
   ```

2. **Configure your environment** — copy `.env.example` to `.env` and fill
   in at minimum:
   - `DISCORD_TOKEN` / `DISCORD_CLIENT_ID` — from the Developer Portal
   - `DISCORD_GUILD_ID` — optional, but set it during development so slash
     commands register instantly to one server instead of waiting up to an
     hour for global registration to propagate
   - `DATABASE_URL` — a Postgres connection string

   Everything else in `.env.example` is optional — see
   [Environment variables](#environment-variables) for the full list.

3. **Enable the Message Content Intent** — in the Developer Portal, under
   your application → **Bot** → **Privileged Gateway Intents**, turn on
   **Message Content Intent**. This is required for the prefix-command
   handler to read message text; Discord requires it to be enabled both in
   the portal and in code (already done for you in `structures/BotClient.js`).

4. **Run the database migration**
   ```bash
   npm run migrate
   ```

5. **Start the bot**
   ```bash
   npm run dev    # restarts automatically on file changes
   # or
   npm start      # plain node, for production
   ```

   Commands auto-deploy on boot by default. Once you see the startup
   banner in your terminal, run `/ping` in your server.

## Environment variables

All of these live in `.env` (see `.env.example` for a ready-to-copy
template). Only the first three are required to start the bot.

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `DISCORD_TOKEN` | Yes | — | Your bot's token, from the Developer Portal. |
| `DISCORD_CLIENT_ID` | Yes | — | Your application's client ID. Used to deploy slash commands. |
| `DATABASE_URL` | Yes* | — | Postgres connection string. *Not required if you remove the database layer — see [Database](#database). |
| `DISCORD_GUILD_ID` | No | *(global)* | Deploy commands to one guild instantly instead of globally. Strongly recommended for development. |
| `BOT_OWNERS` | No | *(none)* | Comma-separated Discord user IDs that always resolve to `OWNER` permission level. |
| `DEFAULT_PREFIX` | No | `!` | Prefix used by the legacy message-based command handler. |
| `AUTO_DEPLOY_COMMANDS` | No | `true` | Re-registers all slash/context commands with Discord on every boot. Turn off once you're running global commands across many servers (see [Deploying to production](#deploying-to-production)). |
| `NODE_ENV` | No | `development` | `production` switches logging to JSON output. |
| `LOG_LEVEL` | No | `debug` (`info` in production) | Any [pino level](https://getpino.io/#/docs/api?id=level): `trace`, `debug`, `info`, `warn`, `error`, `fatal`. |
| `ERROR_ALERT_WEBHOOK_URL` | No | *(disabled)* | A Discord webhook URL that gets pinged on an uncaught exception or unhandled rejection. |
| `SENTRY_DSN` | No | *(disabled)* | Enables [Sentry](https://sentry.io) error/performance monitoring. |

## npm scripts

| Script | What it does |
|---|---|
| `npm run dev` | Starts the bot with `nodemon`, restarting on file changes. |
| `npm start` | Starts the bot with plain `node` — use this in production. |
| `npm run start:sharded` | Starts the bot across multiple shards (see [Sharding](#sharding)). |
| `npm run deploy` | Registers slash/context commands with Discord without starting the bot. |
| `npm run clear-global-commands` | Wipes every globally-registered command — useful when migrating from global to guild-scoped commands, or cleaning up during development. |
| `npm run migrate` | Runs any pending database migrations. |
| `npm run migrate:down` | Rolls back the most recent migration. |
| `npm run lint` / `npm run lint:fix` | Lints the codebase with ESLint. |
| `npm test` | Runs the test suite (`node --test`). |

## Project layout

```
src/
├── index.js                # process entrypoint
├── shard.js                 # optional: run across multiple shards
├── config/                  # env loading + validation, permission level enum
├── structures/               # BotClient + base "shapes" for commands/events/components
├── handlers/                 # loader + dispatcher for each module type
├── managers/                 # CooldownManager, PermissionManager
├── commands/
│   ├── slash/utility/ping.js  # the one example command
│   ├── prefix/                # empty — add your own `!`-prefix commands
│   └── context/                # empty — add your own right-click commands
├── components/
│   ├── buttons/pingRefresh.js  # the one example button
│   ├── modals/                  # empty — add your own
│   └── selects/                  # empty — add your own
├── events/
│   ├── client/                  # ready, messageCreate, interactionCreate
│   └── guild/                    # empty — add your own (memberAdd, etc.)
├── services/                  # pingCard.js — the Components V2 builder /ping uses
├── database/                  # re-exports vendor/platform-database
└── utils/                     # file loader, error handler, BotError, startup banner

vendor/
├── platform-database/        # Postgres pool + migrations (see Database below)
├── platform-shared/           # logger + crash-alert webhook helper
└── platform-eslint-config/     # shared lint config (dev-only, not needed to run)
```

These are vendored as local packages (`file:vendor/...` in `package.json`)
rather than published to npm, so you can freely edit them as part of your
own bot instead of treating them as a black box you can't touch.

## Adding a command

Create a file anywhere under `src/commands/slash/<category>/` — the
category folder name is just for your own organization, any name works:

```js
// src/commands/slash/utility/hello.js
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('hello').setDescription('Says hello.'),
  category: 'Utility',
  cooldown: 3,             // seconds; omit for no cooldown
  // permissions: {}       // optional — see "Permissions and cooldowns" below
  execute: async (interaction, client) => {
    await interaction.reply(`Hello, ${interaction.user}!`);
  },
};
```

That's it — no registration step to remember. The loader picks it up on
next boot, and `npm run deploy` (or the default auto-deploy-on-boot) pushes
it to Discord.

**Prefix commands** (`src/commands/prefix/*.js`) and **context menu
commands** (`src/commands/context/*.js`) follow the same "just add a file"
pattern — see `structures/PrefixCommand.js` and
`structures/ContextMenuCommand.js` for their exact shape.

## Adding a button, modal, or select menu

Components are matched by their `customId`, which can be an exact string
or a `RegExp` for dynamic IDs (e.g. a button whose ID encodes a record ID):

```js
// src/components/buttons/confirmDelete.js
module.exports = {
  customId: 'confirm_delete',          // or /^confirm_delete:\d+$/ for a dynamic id
  execute: async (interaction, client) => {
    await interaction.update({ content: 'Deleted.', components: [] });
  },
};
```

Modals (`src/components/modals/*.js`) and select menus
(`src/components/selects/*.js`) work identically — same `customId` +
`execute` shape, just triggered by a different interaction type.

## Adding an event listener

Any [discord.js client event](https://discord.js.org/docs/packages/discord.js/main/Client:Class#events)
works — create a file anywhere under `src/events/`:

```js
// src/events/guild/guildMemberAdd.js
const { Events } = require('discord.js');

module.exports = {
  name: Events.GuildMemberAdd,
  once: false,                          // true for one-time events like ClientReady
  execute: async (client, member) => {
    console.log(`${member.user.tag} joined ${member.guild.name}`);
  },
};
```

Remember: some events need a privileged intent enabled in both the
Developer Portal and `structures/BotClient.js` — `GuildMemberAdd` needs the
**Server Members Intent**, for example. The intent list in `BotClient.js`
has comments explaining which feature needs which intent.

## Permissions and cooldowns

Declare either or both on a command/context-menu module:

```js
module.exports = {
  // ...
  cooldown: 10,   // seconds, per-user, per-command
  permissions: {
    level: PermissionLevel.MODERATOR,      // see config/permissions.js
    ownerOnly: false,                       // true restricts to BOT_OWNERS only
    userPermissions: [PermissionsBitField.Flags.KickMembers],  // the invoking member needs this
    botPermissions: [PermissionsBitField.Flags.KickMembers],   // the bot itself needs this, in this channel
  },
  // ...
};
```

- **`cooldown`** is enforced per-user, per-command — someone hitting their
  own cooldown never affects anyone else.
- **`permissions.level`** checks against the ordered tier in
  `config/permissions.js` (`USER < MODERATOR < ADMIN < DEVELOPER < OWNER`).
  Server Administrators automatically resolve to `ADMIN`; user IDs listed
  in `BOT_OWNERS` always resolve to `OWNER`. Extend
  `PermissionManager.resolveMemberLevel` if you need database-backed staff
  roles later.
- **`userPermissions`** / **`botPermissions`** check real Discord
  permissions (`PermissionsBitField.Flags.*`) — for the member invoking the
  command, and for the bot's own permissions in that specific channel
  (respecting channel-level overwrites, not just server-wide roles).

All of this is checked before `execute` runs, in every handler
(slash, prefix, context menu) — you never need to re-check it yourself.

## Error handling

- **Uncaught exceptions and unhandled promise rejections** are caught at
  the process level (`utils/errorHandler.js`) so one bug can't silently
  kill the bot. They're logged in full and, if configured, reported to
  Sentry and/or posted to a Discord webhook.
- **Every command/component's errors** are caught individually and never
  crash the shared `interactionCreate` listener — the user gets a generic
  "something went wrong" reply instead of Discord showing "This
  interaction failed."
- **Expected, user-caused failures** should throw `BotError` instead of a
  plain `Error`:

  ```js
  const { BotError } = require('../../../utils/BotError');

  if (target.id === interaction.user.id) {
    throw new BotError("You can't do that to yourself.");
  }
  ```

  A `BotError`'s message is shown to the user verbatim and logged as a
  warning, not an error — it's not a bug, it's an expected outcome.
  Anything else you throw is treated as a real bug: logged in full with a
  stack trace, reported to Sentry if configured, and the user just sees
  the generic fallback message (internals never leak to end users).

## Database

`vendor/platform-database` is a small, self-contained package: a pooled
`pg` connection plus [node-pg-migrate](https://github.com/salsita/node-pg-migrate)
for schema migrations.

- **`vendor/platform-database/migrations/`** — one file per schema change,
  run in order. Create a new one with:
  ```bash
  npm run migrate --prefix vendor/platform-database create <name>
  ```
- **`vendor/platform-database/src/queries/`** — one file per table/domain.
  `guildSettings.js` is the included example (`getByGuildId`, `upsert`),
  demonstrating the "one row per guild, upsert on save" pattern most bots
  need for configurable per-server settings. Copy its shape for your own
  tables.
- **Using it from bot code:**
  ```js
  const { guildSettings } = require('../../database'); // adjust ../ depth as needed

  const settings = await guildSettings.getByGuildId(interaction.guild.id);
  ```

**Don't need a database?** Remove it cleanly:
1. Delete `vendor/platform-database`.
2. Remove `@platform/database` from `package.json`.
3. Remove `DATABASE_URL` from `REQUIRED_ENV_VARS` in `src/config/index.js`.
4. Delete `src/database/`.

## Running with Docker

A multi-stage `Dockerfile` is included:

```bash
docker build -t my-bot .
docker run --env-file .env my-bot
```

It installs only production dependencies and runs as a non-root `node`
user. Point `DATABASE_URL` at a reachable Postgres instance (a separate
container, or a managed database) — the Dockerfile doesn't bundle Postgres
itself.

## Sharding

For a bot in enough servers to actually need it:

```bash
npm run start:sharded
```

This spawns one process per shard automatically via discord.js's
`ShardingManager` (see `src/shard.js`), with the shard count decided
automatically by Discord's recommended value. Most bots never need this —
a single process (`npm start`) comfortably handles well over a thousand
servers.

## Deploying to production

1. Set `NODE_ENV=production` — switches logging to structured JSON.
2. Once you're running **global** commands across many servers, set
   `AUTO_DEPLOY_COMMANDS=false` and deploy deliberately with
   `npm run deploy` instead. Global command updates are capped at 200/day
   per application, so you don't want every restart burning one.
3. Configure `ERROR_ALERT_WEBHOOK_URL` and/or `SENTRY_DSN` so you find out
   about crashes immediately instead of from a bug report.
4. Use a process manager (`pm2`, systemd, your platform's own restart
   policy) or the included `Dockerfile` so the bot restarts automatically
   if it ever does crash.

## Troubleshooting

- **A command doesn't show up in Discord** — check the startup banner
  logged how many commands loaded. If the count is right but Discord still
  doesn't show it, you're likely waiting on global command propagation
  (up to an hour) — set `DISCORD_GUILD_ID` during development to get
  instant, guild-scoped registration instead.
- **Prefix commands don't respond to anything** — make sure **Message
  Content Intent** is enabled in the Developer Portal (Bot → Privileged
  Gateway Intents), not just in code.
- **`npm run migrate` fails to connect** — double-check `DATABASE_URL`,
  and that Postgres is actually running and reachable from where the bot
  runs (a different story for `localhost` inside vs. outside Docker).
- **A command replies with "something went wrong"** — check the console;
  the real error is logged in full there (and reported to Sentry if
  configured) even though the user only sees the generic message.

## Contributing

Issues and pull requests are welcome. If you're proposing a structural
change (a new handler type, a different permission model), open an issue
first to discuss the approach — this repo's whole value is staying small
and easy to understand, so new complexity should earn its place.

## License

MIT — see [LICENSE](LICENSE). Use it for whatever you want, no attribution
required (though it's always appreciated).
