const http = require('http');
const fs = require('fs');
const { Collection, ActivityType } = require('discord.js');
const client = require('./utils/client');
const { scheduleLeaderboards } = require('./utils/scheduler');

require('dotenv').config();

console.log('🚀 Starting WizardBot initialization...');

const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Electro Titan Bot is running 24/7!\n');
}).listen(PORT, () => {
  console.log(`🌐 Web Service keep-alive server listening on port ${PORT}`);
});

// Environment Variables check & sanitization
const rawToken = process.env.DISCORD_TOKEN || '';
const token = rawToken.replace(/^["']|["']$/g, '').trim();
const mongoUri = process.env.MONGO_URI ? process.env.MONGO_URI.trim() : null;
const clashToken = process.env.CLASH_TOKEN ? process.env.CLASH_TOKEN.trim() : null;

console.log('--- Environment Check ---');
console.log(`DISCORD_TOKEN present: ${token ? 'YES (Length: ' + token.length + ', Prefix: ' + token.substring(0, 10) + '...)' : '❌ NO'}`);
console.log(`MONGO_URI present: ${mongoUri ? 'YES' : '❌ NO'}`);
console.log(`CLASH_TOKEN present: ${clashToken ? 'YES' : '❌ NO'}`);
console.log('-------------------------');

client.commands = new Collection();

console.log('📦 Loading commands...');
try {
  const commandFolders = fs.readdirSync('./service/commands');
  for (const folder of commandFolders) {
    const commandFiles = fs
      .readdirSync(`./service/commands/${folder}`)
      .filter((file) => file.endsWith('.js'));
    for (const file of commandFiles) {
      const command = require(`./service/commands/${folder}/${file}`);
      client.commands.set(command.data.name, command);
    }
  }
  console.log(`✅ Loaded ${client.commands.size} slash commands.`);
} catch (err) {
  console.error('❌ Error loading commands:', err);
}

console.log('📦 Loading events...');
try {
  const eventFolders = fs.readdirSync('./service/events');
  for (const folder of eventFolders) {
    const eventFiles = fs
      .readdirSync(`./service/events/${folder}`)
      .filter((file) => file.endsWith('.js'));
    for (const file of eventFiles) {
      const event = require(`./service/events/${folder}/${file}`);
      if (event.once) client.once(event.name, (...args) => event.execute(...args));
      else client.on(event.name, (...args) => event.execute(...args));
    }
  }
  console.log('✅ Events loaded.');
} catch (err) {
  console.error('❌ Error loading events:', err);
}

client.on('error', (err) => {
  console.error('❌ Discord Client Error:', err);
});

client.on('warn', (warning) => {
  console.warn('⚠️ Discord Client Warning:', warning);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (e) {
    console.log(`${new Date().toString()} - ${e}`);
    await interaction.editReply({
      content: 'There was an error while executing this command!',
      ephemeral: true,
    });
  }
});

const onReady = () => {
  console.log(`🎉 SUCCESS! Bot is ONLINE as ${client.user ? client.user.tag : 'Connected Bot'}!`);
  if (client.user) {
    client.user.setPresence({ activities: [{ name: 'with fireballs 🔥', type: ActivityType.Playing }], status: 'online'});
  }
  try {
    scheduleLeaderboards();
  } catch (err) {
    console.error('⚠️ Leaderboard scheduling notice:', err.message);
  }
};

client.once('ready', onReady);
client.once('clientReady', onReady);

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
});

if (!token) {
  console.error('❌ CRITICAL: DISCORD_TOKEN environment variable is empty or missing!');
} else {
  console.log('🔄 Initiating Discord WebSocket connection...');
  client.login(token)
    .then((resToken) => {
      console.log('🟢 client.login() resolved successfully! Bot connected to Gateway.');
    })
    .catch((err) => {
      console.error('❌ DISCORD LOGIN FAILED WITH ERROR:', err);
    });
}
