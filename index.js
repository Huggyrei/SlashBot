import { Client, GatewayIntentBits } from 'discord.js';
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
	],
})

import Game from './game.js';
var game = new Game()

client.on('ready', () => {
 console.log(`Logged in as ${client.user.tag}!`);
 });

client.on('messageCreate', msg => {
    if(msg.author.bot) {return;}
    game.messagehandler(msg,client.user.id);
 });

client.login(process.env.LOGIN_TOKEN);