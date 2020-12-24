const { sendMessageTo, createEmbed } = require('../utils/messages');
const { GAME_STATUS } = require('../constants/status');
const { isBot } = require('../utils/bot');

const games = [];

const createPlayer = (player) => ({
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
    doubleGenerala: undefined,
  },
});

const createEmptyGame = (author) => {
  if (!games.some((game) => game.creator === author)) {
    const game = {
      players: [createPlayer(author)],
      handReactions: [author],
      creator: author,
      playerTurn: {
        player: author,
        rolledTimes: 0,
        savedDices: [],
      },
      status: GAME_STATUS.CREATION,
    };
    games.push(game);
    return game;
  }
  // console.log(games);
};

const startGame = (game, gameMessage) => {
  const newPlayers = game.handReactions
    .filter((user) => !isBot(user.id) && user.id !== game.creator.id)
    .map((user) => createPlayer(user));
  game.players = [...game.players, ...newPlayers];
  game.status = GAME_STATUS.INGAME;
  delete game.handReactions;

  gameMessage.edit({
    embed: createEmbed('Game is starting!', {
      fields: [
        {
          name: `First player is: ${game.playerTurn.player.username}`,
          value: 'Roll the dice with &roll!',
        },
      ],
    }),
  });
};

const sendGameMessage = async (message) => {
  const gameCreationMessage = await sendMessageTo(
    message.channel.id,
    `${message.author.username} is creating a game!`,
    {
      fields: [
        {
          name: 'Join the game!',
          value: 'React with 🤚',
          inline: true,
        },
        {
          name: '\u200b',
          value: '\u200b',
          inline: true,
        },
        {
          name: 'Start the game!',
          value: 'Start with ▶',
          inline: true,
        },
      ],
    }
  );
  gameCreationMessage.react('🤚');
  gameCreationMessage.react('▶');
  return gameCreationMessage;
};

module.exports = {
  games,
  sendGameMessage,
  createEmptyGame,
  createPlayer,
  startGame,
};
