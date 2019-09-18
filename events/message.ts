import ReknownClient from '../structures/client';
import { Message } from 'discord.js';

module.exports.run = async (client: ReknownClient, message: Message): Promise<void> => {
  if (message.author.bot || !message.guild.available) return;
  if (message.member.partial) await message.member.fetch();

  const prefix = await client.functions.getPrefix(client, message.guild.id);
  const regexp = new RegExp(`^<@!?${message.client.user.id}> `);
  if ((!message.content.startsWith(prefix) && !message.content.match(regexp)) || message.content === prefix) return;

  let args: string[];
  if (message.content.match(regexp)) args = message.content.slice(message.content.match(regexp)[0].length).split(/ +/g);
  else args = message.content.slice(prefix.length).split(/ +/g);
  let cmd = args[0].toLowerCase();
  if (!Object.keys(client.aliases).includes(cmd)) return;
  cmd = client.aliases[cmd];

  client.commands.get(cmd).run(client, message, args);
};