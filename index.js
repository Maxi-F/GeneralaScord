require('dotenv').config();
const Discord = require('discord.js');
const bot = new Discord.Client();
const TOKEN = process.env.TOKEN;
const COMMANDS = require('./commands');

bot.login(TOKEN);

processMessage = (message) => console.log(message);

bot.on('ready', () => {
  console.info(`Logged in as ${bot.user.tag}!`);
});

bot.on('message', message => {
  message.content[0] === '&' && processMessage(message.content.slice(1)) 
});