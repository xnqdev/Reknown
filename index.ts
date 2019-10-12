/* eslint-disable @typescript-eslint/no-var-requires, global-require */

import * as Discord from 'discord.js';
import { readdirSync } from 'fs';
import ReknownClient from './structures/client';

require('dotenv').config();

const client = new ReknownClient({
  disableEveryone: true,
  partials: [ 'GUILD_MEMBER', 'MESSAGE', 'USER' ]
});
const categories = readdirSync('./commands');
categories.forEach(name => readdirSync(`./commands/${name}`).forEach(f => client.commands.set(f.slice(0, -3), require(`./commands/${name}/${f}`))));
client.events = new Discord.Collection(readdirSync('./events').map(f => [ f.slice(0, -3), require(`./events/${f}`) ]));
client.commands.forEach((obj, name) => {
  obj.help.aliases.forEach(alias => {
    client.aliases[alias] = name;
  });
  client.aliases[name] = name;
});
client.categories = [ ...new Set(client.commands.map(c => c.help.category)) ];

client.events.forEach((obj, name) => client.on(name, (...args: any) => obj.run(client, ...args)));

process.on('unhandledRejection', console.log);

client.login(process.env.BOT_TOKEN);
