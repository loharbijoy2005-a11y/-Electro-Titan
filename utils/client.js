const { Client, GatewayIntentBits, Intents, Partials } = require('discord.js');

// Support both discord.js v14 (GatewayIntentBits) and v13 fallback
const intents = GatewayIntentBits
  ? [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMembers,
    ]
  : [
      Intents?.FLAGS?.GUILDS || 'GUILDS',
      Intents?.FLAGS?.GUILD_MESSAGES || 'GUILD_MESSAGES',
      Intents?.FLAGS?.GUILD_MEMBERS || 'GUILD_MEMBERS',
    ];

const partials = Partials
  ? [
      Partials.Channel,
      Partials.Message,
      Partials.User,
      Partials.GuildMember,
      Partials.Reaction,
    ]
  : [];

const client = new Client({
  intents,
  partials,
});

module.exports = client;