const { sendMessageTo } = require('../utils/messages');
const { GAME_STATUS } = require('../constants/status');

const games = [];

const createPlayer = playerId => ({
  id: playerId,
  table: {
    ones: undefined,
    twos: undefined,
    threes: undefined,
    fours: undefined,
    fives: undefined,
    sixes: undefined,
    double: undefined,
    poker: undefined,
    straight: undefined,
    full: undefined,
    generala: undefined,
    doubleGenerala: undefined
  }
})

const createEmptyGame = (author) => {
  if(!games.some(game => game.creator === author)) {
    const game = {
      players: [createPlayer(author)],
      handReactions: [author],
      creator: author,
      playerTurn: {
        id: author,
        rolledTimes: 0,
        savedDices: []
      },
      status: GAME_STATUS.CREATION
    }
    games.push(game);
    return game;
  }
  // console.log(games);
}

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

module.exports = { games, sendGameMessage, createEmptyGame, createPlayer }
