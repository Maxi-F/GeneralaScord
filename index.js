require('dotenv').config();
const bot = require('./bot.js')
const processMessage = require('./commands');
const { COMMAND_TOKEN } = require('./constants/commandToken');

bot.on('ready', () => {
  console.info(`Logged in as ${bot.user.tag}!`);
});

bot.on('message', message => {
  message.content[0] === COMMAND_TOKEN && processMessage(message.content.slice(1), message) 
});

bot.on('messageReactionAdd', () => console.log('me quiero volver chango'))
