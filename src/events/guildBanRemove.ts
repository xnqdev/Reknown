import { MessageEmbed } from 'discord.js';
import type ReknownClient from '../structures/client';
import type { Guild, PartialUser, User } from 'discord.js';

function sendLog (client: ReknownClient, guild: Guild, user: User) {
  const embed = new MessageEmbed()
    .addField('User', user.tag)
    .setColor(client.config.embedColor)
    .setFooter(`ID: ${user.id}`)
    .setThumbnail(user.displayAvatarURL({ size: 512 }))
    .setTimestamp()
    .setTitle('Member Unbanned');

  client.functions.sendLog(client, embed, guild);
}

export async function run (client: ReknownClient, guild: Guild, user: User | PartialUser) {
  if (!guild.available) return;
  if (user.partial) user = await user.fetch();

  sendLog(client, guild, user);
}
