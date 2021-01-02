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
  if (
    !games.some(
      (game) => game.creator === author && game.status === GAME_STATUS.INGAME
    )
  ) {
    const game = {
      players: [createPlayer(author)],
      handReactions: [author],
      creator: author,
      playerTurn: {
        user: author,
        rolledTimes: 0,
        savedDices: [],
        hasGenerala: false,
      },
      status: GAME_STATUS.CREATION,
    };

    return game;
  }
};

const createSavedDices = () =>
  Array.apply(null, Array(5)).map(() => ({
    diceResult: undefined,
    saved: false,
  }));

const getGameFrom = (userId) =>
  games.find((game) =>
    game.players.some((player) => player.user.id === userId)
  );

const stopCreation = (game, gameMessage) => {
  game.status = GAME_STATUS.CANCELED;

  gameMessage.edit({
    embed: createEmbed('Game was canceled'),
  });
};

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

  games.push(game);
  return sendTurnMessage(gameMessage.channel.id, game.playerTurn.user);
};

const findPlayer = (game, userId) =>
  game.players.find((player) => player.user.id === userId);

const isMyTurn = (userId, game) => game.playerTurn.user.id === userId;

const passTurn = (game, prevPlayer) => {
  const nextPlayerIndex =
    (game.players.findIndex((player) => player.user.id === prevPlayer.user.id) +
      1) %
    game.players.length;
  game.playerTurn = {
    user: game.players[nextPlayerIndex].user,
    rolledTimes: 0,
    savedDices: createSavedDices(),
    hasGenerala: false,
  };
};

const usedOptions = (game, userId) =>
  Object.entries(findPlayer(game, userId).table)
    .filter(([, value]) => value !== undefined)
    .map(([option]) => option);

const isGameFinished = (game) =>
  !game.players
    .flatMap((player) => Object.values(player.table))
    .some((tableValue) => tableValue === undefined);

const calculateTotalPoints = (player) =>
  Object.values(player.table).reduce(
    (acum, curr) => (curr === undefined ? acum : acum + curr),
    0
  );

const calculateFinishedGameTable = (game) =>
  game.players
    .map((player) => ({
      user: player.user,
      points: calculateTotalPoints(player),
    }))
    .sort((aPlayer, anotherPlayer) => anotherPlayer.points - aPlayer.points);

const removePlayerFromAndPassTurn = async (game, userId, channelId) => {
  const playerToRemove = findPlayer(game, userId);

  if (game.playerTurn.user.id === userId && game.players.length > 1) {
    passTurn(game, playerToRemove);
    await sendTurnMessage(channelId, playerToRemove.user);
  }

  game.players = game.players.filter((player) => player.user.id !== userId);

  if (!game.players.length) {
    game.status = GAME_STATUS.FINISHED;
  }
};

module.exports = {
  games,
  createEmptyGame,
  createPlayer,
  findPlayer,
  startGame,
  stopCreation,
  usedOptions,
  getGameFrom,
  removePlayerFromAndPassTurn,
  isMyTurn,
  passTurn,
  isGameFinished,
  calculateFinishedGameTable,
  calculateTotalPoints,
};
