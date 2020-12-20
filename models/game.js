const { sendMessageTo } = require('../utils/messages');

const createGameMessage = async (message) => {
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

module.exports = { createGameMessage }
