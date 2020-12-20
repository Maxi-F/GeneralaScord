const { sendMessageTo, sendTurnMessage, createEmbed } = require('../utils/messages');
const { GAME_STATUS } = require('../constants/status');
const { isBot } = require('../utils/bot');

const games = [];

const createPlayer = player => ({
  user: player,
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
  if (!games.some(game => game.creator === author)) {
    const game = {
      players: [createPlayer(author)],
      handReactions: [author],
      creator: author,
      playerTurn: {
        user: author,
        rolledTimes: 0,
        savedDices: []
      },
      status: GAME_STATUS.CREATION
    }
    games.push(game);
    return game;
  }
}

const getGameFrom = (userId) => games.find(game => game.players.some(player => player.user.id === userId))

const startGame = (game, gameMessage) => {
  const newPlayers = game.handReactions
    .filter(user => !isBot(user.id) && user.id !== game.creator.id)
    .map(user => createPlayer(user));
  game.players = [...game.players, ...newPlayers]
  game.status = GAME_STATUS.INGAME;
  delete game.handReactions;

  console.log(`Empezando el Juego de ${game.creator.username}.`, `Jugadores: ${game.players.map(player => player.user.username)}`)

  gameMessage.edit({
    embed: createEmbed(`Game has started!`),
  });

  return sendTurnMessage(gameMessage.channel.id, game.playerTurn.user)
}

module.exports = { games, createEmptyGame, createPlayer, startGame, getGameFrom }
