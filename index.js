const Discord = require('discord.js');
const client = new Discord.Client({ intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES
]});
const Game = require('./game.js')
let game = new Game()

client.on('ready', () => {
 console.log(`Logged in as ${client.user.tag}!`);
 });

client.on('messageCreate', msg => {
    if(msg.author.bot) {return;}
    game.messagehandler(msg,client.user.id);
 });

let token = process.env.LOGIN_TOKEN
if (!token) throw new Error("Missing token")

client.login(token);