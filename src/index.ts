import 'dotenv/config';
import { Client, Intents } from 'discord.js';
import fs from 'fs';
import path from 'path';

import { ICommand } from './types';

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGE_REACTIONS] });
const commands: ICommand[] = [];

client.on('ready', async () => {
  client.user?.setActivity({ name: 'notams', type: 'WATCHING' });
  console.log(`Logged in as ${client.user?.tag}`);

  const files = await fs.promises.readdir(path.join(__dirname, 'commands/'));  
  for (const f of files) {
    if (['ts', 'js'].includes(f.split('.').pop() || '')) {
      commands.push((await import(path.join(__dirname, `commands/${f}`))).default);
    }
  }
});

client.on('interactionCreate', (interaction) => {
  if (!interaction.isCommand()) return;

  for (const cmd of commands) {
    if (cmd.name === interaction.commandName) {
      cmd.executor(interaction);
      break;
    }
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);