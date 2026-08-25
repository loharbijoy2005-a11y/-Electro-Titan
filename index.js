const http = require('http');
const fs = require('fs');
const { Collection, ActivityType } = require('discord.js');
const client = require('./utils/client');
const { scheduleLeaderboards } = require('./utils/scheduler');

require('dotenv').config();

const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('WizardBot is running!\n');
}).listen(PORT, () => {
  console.log(`Web Service server listening on port ${PORT}`);
});

client.commands = new Collection();

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

client.once('ready', () => {
  console.log(`✅ Bot logged in as ${client.user.tag}! Status: Ready!`);
  client.user.setPresence({ activities: [{ name: 'with fireballs 🔥', type: ActivityType.Playing }], status: 'online'});
  scheduleLeaderboards();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
});

const token = process.env.DISCORD_TOKEN ? process.env.DISCORD_TOKEN.trim() : null;
if (!token) {
  console.error('❌ ERROR: DISCORD_TOKEN is missing or empty in Environment Variables!');
} else {
  console.log('🔄 Attempting Discord login...');
  client.login(token).catch((err) => {
    console.error('❌ DISCORD LOGIN FAILED:', err.message);
  });
}
