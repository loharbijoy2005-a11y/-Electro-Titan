const discord = require('discord.js');
const { Client, GatewayIntentBits, Intents, Partials } = discord;

// Using standard unprivileged intents so bot connects instantly without requiring Privileged Intents toggles
const intents = GatewayIntentBits
  ? [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
    ]
  : [
      Intents?.FLAGS?.GUILDS || 'GUILDS',
      Intents?.FLAGS?.GUILD_MESSAGES || 'GUILD_MESSAGES',
    ];

const partials = Partials
  ? [
      Partials.Channel,
      Partials.Message,
      Partials.User,
    ]
  : [];

const client = new Client({
  intents,
  partials,
});

module.exports = client;