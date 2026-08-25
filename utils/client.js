const discord = require('discord.js');
const { Client, GatewayIntentBits, Intents, Partials } = discord;

// Check if GatewayIntentBits exists (v14) or fallback to Intents.FLAGS (v13) to prevent crashes on any server environment
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