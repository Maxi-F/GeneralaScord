const { sendTurnMessage, createEmbed } = require('../utils/messages');
const { GAME_STATUS } = require('../constants/status');
const { TABLE_OPTIONS } = require('../constants/tableOptions');
const { isBot } = require('../utils/bot');

const games = [];

const createPlayer = (player) => ({
  user: player,
  table: {
    [TABLE_OPTIONS.ONES]: undefined,
    [TABLE_OPTIONS.TWOS]: undefined,
    [TABLE_OPTIONS.THREES]: undefined,
    [TABLE_OPTIONS.FOURS]: undefined,
    [TABLE_OPTIONS.FIVES]: undefined,
    [TABLE_OPTIONS.SIXES]: undefined,
    [TABLE_OPTIONS.DOUBLE]: undefined,
    [TABLE_OPTIONS.POKER]: undefined,
    [TABLE_OPTIONS.STRAIGHT]: undefined,
    [TABLE_OPTIONS.FULL]: undefined,
    [TABLE_OPTIONS.GENERALA]: undefined,
    [TABLE_OPTIONS.DOUBLE_GENERALA]: undefined,
  },
});

const createEmptyGame = (author) => {
  if (!games.some((game) => game.creator === author)) {
    const game = {
      players: [createPlayer(author)],
      handReactions: [author],
      creator: author,
      playerTurn: {
        user: author,
        rolledTimes: 0,
        savedDices: [],
      },
      status: GAME_STATUS.CREATION,
    };
    games.push(game);
    return game;
  }
};

const createSavedDices = () =>
  Array.apply(null, Array(5)).map(() => ({
    diceResult: undefined,
    saved: false,
    fixed: false,
  }));

const getGameFrom = (userId) =>
  games.find((game) =>
    game.players.some((player) => player.user.id === userId)
  );

const startGame = (game, gameMessage) => {
  const newPlayers = game.handReactions
    .filter((user) => !isBot(user.id) && user.id !== game.creator.id)
    .map((user) => createPlayer(user));
  game.players = [...game.players, ...newPlayers];
  game.status = GAME_STATUS.INGAME;
  delete game.handReactions;

  console.log(
    `Empezando el Juego de ${game.creator.username}.`,
    `Jugadores: ${game.players.map((player) => player.user.username)}`
  );

  gameMessage.edit({
    embed: createEmbed('Game has started!'),
  });

  game.playerTurn.savedDices = createSavedDices();

  return sendTurnMessage(gameMessage.channel.id, game.playerTurn.user);
};

module.exports = {
  games,
  createEmptyGame,
  createPlayer,
  startGame,
  getGameFrom,
};
