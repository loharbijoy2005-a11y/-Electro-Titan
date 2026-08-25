require('dotenv').config()
const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v9')
const { IDs } = require('./config.json')
const fs = require('node:fs')

const commands = []
const commandFolders = fs.readdirSync('./service/commands')

for (const folder of commandFolders) {
    const commandFiles = fs.readdirSync(`./service/commands/${folder}`).filter(file => file.endsWith('.js'))
    for (const file of commandFiles) {
      const command = require(`./service/commands/${folder}/${file}`)
      commands.push(command.data.toJSON())
    }
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
	try {
		console.log('Started refreshing application (/) commands.')

		const guilds = ['1153533613195935775', '1297566791417073704'];
		for (const guildId of guilds) {
			await rest.put(
				Routes.applicationGuildCommands(IDs.client, guildId),
				{ body: commands },
			);
		}

		console.log('Successfully reloaded application (/) commands.')
	} catch (error) {
		console.error(error)
	}
})()