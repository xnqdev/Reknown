import { DMChannel } from 'discord.js';
import type { Message } from 'discord.js';
import type ReknownClient from '../structures/client';
import type { RowDisabledCommands } from 'ReknownBot';
import { tables } from '../Constants';

const cooldowns = new Set();

export async function run (client: ReknownClient, message: Message) {
  if (message.author!.bot || message.guild && !message.guild.available) return;
  if (message.webhookID) return;

  const prefix = message.guild ? await client.functions.getPrefix(client, message.guild.id) : client.config.prefix;
  const regexp = new RegExp(`^<@!?${message.client.user!.id}> `);
  if (!message.content.startsWith(prefix) && !message.content.match(regexp) || message.content === prefix) return;

  let str: string;
  if (message.content.match(regexp)) str = message.content.slice(message.content.match(regexp)![0].length);
  else str = message.content.slice(prefix.length);

  const args = client.functions.parseArgs(str);
  let cmd = args[0];
  if (!Object.keys(client.commands.aliases).includes(cmd)) return;

  if (message.guild) {
    if (cooldowns.has(message.guild.id)) return message.reply('This server is still on command cooldown! Please try again.');
    cooldowns.add(message.guild.id);
    setTimeout(() => cooldowns.delete(message.guild!.id), 150);
  }

  cmd = client.commands.aliases[cmd];
  if (message.guild) {
    const disabled = await client.functions.getRow<RowDisabledCommands>(client, tables.DISABLEDCOMMANDS, {
      command: cmd,
      guildid: message.guild.id
    });
    if (disabled) return;
  }

  const cmdInfo = client.commands.get(cmd)!;
  if (message.channel instanceof DMChannel) {
    if (!cmdInfo.help.dm) return message.reply('This command is only available in servers.');
  } else if (!message.channel.permissionsFor(message.member!)!.has(cmdInfo.memberPerms)) return client.functions.noPerms(message, cmdInfo.memberPerms, message.channel);
  else if (!message.channel.permissionsFor(client.user!)!.has(cmdInfo.permissions)) return client.functions.noClientPerms(message, cmdInfo.permissions, message.channel);
  cmdInfo.run(client, message, args);
}
