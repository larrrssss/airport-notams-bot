import { getColor } from 'discord-embed-colors';
import { CommandInteraction, Message, MessageEmbed } from 'discord.js';

import { getNotams, formatNotam } from '../lib/autorouter';

const limit = 5;

function formatArrayToString(arr: string[], skip: number): string {
  let str = '';
  for (let i = 0; i < arr.length; i += 1) {    
    str += `#${i + 1 + skip}\`\`\`${arr[i]}\`\`\`\n\n`;
  }
  return str;
}

async function executor(interaction: CommandInteraction): Promise<void> {
  const icao = (interaction.options.get('airport')?.value as string).toUpperCase() || '';

  if (icao.length !== 4) {
    const embed = new MessageEmbed()
      .setFooter('Made with ❤️ from Germany')
      .setTimestamp()
      .setTitle('Invalid icao code')
      .setColor(getColor('RED'));
    interaction.reply({ embeds: [embed], ephemeral: true });
    return;
  }

  const notams = await getNotams(icao);
  if (!notams || notams.length === 0) {
    const embed = new MessageEmbed()
      .setFooter('Made with ❤️ from Germany')
      .setTimestamp()
      .setTitle('We couldn\'t find any notams for this icao code')
      .setColor(getColor('RED'));
    interaction.reply({ embeds: [embed], ephemeral: true });
    return;
  }

  const notamAsString = notams.map(formatNotam);

  const embed = new MessageEmbed()
    .setTitle(`NOTAMs for ${icao}`)
    .setFooter('Made with ❤️ from Germany')
    .setTimestamp()
    .setColor(getColor('BLUE'));
    
  let skip = 0;
  let page = 1;

  let content = formatArrayToString(notamAsString.slice(skip, skip + limit), 0);
  content += `${page}/${Math.floor(notamAsString.length / limit)}`;

  embed.setDescription(content);

  const message = await interaction.reply({ 
    embeds: [embed], 
    fetchReply: true,
  }) as Message;

  if (notamAsString.length < limit) return;

  await message.react('◀️');
  await message.react('▶️');

  const collector = message.createReactionCollector({ time: 3 * 60 * 1000, filter: (_, user) => user.id === interaction.user.id });

  collector.on('collect', async (reaction, user) => {
    if (reaction.emoji.name === '◀️') {
      if (skip - limit < 0) {
        skip = 0;
        page = 1;
      } else {
        skip -= limit;
        page--;
      }
    } 
    
    if (reaction.emoji.name === '▶️') {
      if (skip + limit >= notamAsString.length) {
        skip = 0;
        page = 1;
      } else {
        skip += limit;
        page++;
      }
    }

    let content = formatArrayToString(notamAsString.slice(skip, skip + limit), skip);
    content += `${page}/${Math.floor(notamAsString.length / 5)}`;

    if (content.length > 4096) {
      embed
        .setTitle('Oops, looks like something went wrong')
        .setColor(getColor('RED'))
        .setDescription('');
      collector.stop('message is too long');
    } else {
      embed.setDescription(content);
    }

    await Promise.all([
      message.edit({ embeds: [embed] }),
      reaction.users.remove(user.id),
    ]);
  });

  collector.on('end', () => {
    message.reactions.removeAll();
  });
}

export default {
  name: 'notams',
  executor,
};