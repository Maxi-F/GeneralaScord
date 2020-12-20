const bot = require('../bot.js');
const { ROLL_REACTIONS } = require('../constants/reactions.js');

const createEmbed = (message, embedInfo) => ({
  color: '#0099ff',
  title: 'GeneralaScord',
  description: message,
  ...embedInfo
})

const sendMessageTo = (channelId, message, embedInfo = {}) => {
  const channel = bot.channels.cache.get(channelId);
  return channel.send({ embed: createEmbed(message, embedInfo) })
}

const sendTurnMessage = (channelId, player) => sendMessageTo(channelId, `Next turn: ${player}`)

const sendGameMessage = async (message) => {
  const gameCreationMessage = await sendMessageTo(message.channel.id, `${message.author.username} is creating a game!`, {
    fields: [{
      name: 'Join the game!',
      value: 'React with 🤚',
      inline: true
    },
    {
      name: '\u200b',
      value: '\u200b',
      inline: true,
    },
    {
      name: 'Start the game!',
      value: 'Start with ▶',
      inline: true
    }]
  })
  gameCreationMessage.react('🤚');
  gameCreationMessage.react('▶');
  return gameCreationMessage;
}

const sendRollMessage = async (message, game, result, options) => {
  const rollMessage = await sendMessageTo(message.channel.id, `${game.playerTurn.user} rolled!`, {
    fields: [{
      name: 'rolled dice: ',
      value: `\`\`\`${result.join(', ')}\`\`\``
    }]
  })
  ROLL_REACTIONS.forEach(async reaction => await rollMessage.react(reaction))
  return rollMessage;
}

module.exports = { sendMessageTo, createEmbed, sendTurnMessage, sendGameMessage, sendRollMessage }
