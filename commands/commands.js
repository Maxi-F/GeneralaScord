const { roll } = require('../utils/dice');
const { sendMessageTo, createEmbed } = require('../utils/messages');
const { options } = require('../utils/generala');
const {
  sendGameMessage,
  createEmptyGame,
  startGame,
} = require('../models/game');
const {
  creationReactionListener,
  creationReactionFilter,
} = require('../models/reactions');
const { GAME_STATUS } = require('../constants/status');

const notFound = (command, message) =>
  sendMessageTo(message.channel.id, `${command} is not a command.`);

const rollDice = (message) => {
  let result = roll(5).sort();
  return sendMessageTo(
    message.channel.id,
    `rolled dice: ${result}\noptions: ${options(result)}`
  );
};

const createGame = async (message) => {
  const game = createEmptyGame(message.author);
  //   console.log("juego:", game)
  const gameCreationMessage = await sendGameMessage(message);
  const creationCollector = gameCreationMessage.createReactionCollector(
    creationReactionFilter,
    { time: 40000 }
  );

  creationCollector.on('collect', (reaction) =>
    creationReactionListener(game, reaction, gameCreationMessage)
  );
  creationCollector.on(
    'end',
    () =>
      game.status !== GAME_STATUS.INGAME && startGame(game, gameCreationMessage)
  );
};

const playGame = (message) => sendMessageTo(message.channel.id, 'play game!');

const endGame = (message) => sendMessageTo(message.channel.id, 'game ended');

module.exports = { notFound, rollDice, playGame, endGame, createGame };
