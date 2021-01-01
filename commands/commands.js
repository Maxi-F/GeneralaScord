const { roll } = require('../utils/dice');
const {
  sendMessageTo,
  sendGameMessage,
  sendRollMessage,
  reactNumbers,
} = require('../utils/messages');
const { options, calculatePoints } = require('../utils/generala');
const {
  createEmptyGame,
  startGame,
  getGameFrom,
  isMyTurn,
  findPlayer,
} = require('../models/game');
const {
  creationReactionListener,
  creationReactionFilter,
  rollReactionFilter,
  addBlockedRoll,
  removeBlockedRoll,
} = require('../models/reactions');
const { GAME_STATUS } = require('../constants/status');

const notFound = (command, message) =>
  sendMessageTo(message.channel.id, `${command} is not a command.`);

const rollDice = async (message) => {
  const game = getGameFrom(message.author.id);
  if (game && game.status === GAME_STATUS.INGAME) {
    if (!isMyTurn(message.author.id, game))
      return sendMessageTo(
        message.channel.id,
        `${message.author.username}, it is not your turn!`
      );

    if (game.playerTurn.rolledTimes === 3)
      return sendMessageTo(
        message.channel.id,
        `${message.author.username}, you already rolled 3 times`
      );

    let result = roll(5).sort();
    game.playerTurn.rolledTimes++;
    game.playerTurn.savedDices.forEach((dice, index) => {
      if (!dice.saved) {
        dice.diceResult = result[index];
      } else {
        result[index] = dice.diceResult;
        dice.fixed = true;
      }
    });

    let resultOptions = options(result);

    const rollMessage = await sendRollMessage(
      message,
      game,
      result,
      resultOptions
    );

    // console.log(rollMessage.embeds[0])

    const rollReactionCollector = rollMessage.createReactionCollector(
      rollReactionFilter(message.author.id),
      { idle: 60000, dispose: true }
    );

    reactNumbers(rollMessage, game);

    rollReactionCollector.on('collect', (reaction) =>
      addBlockedRoll(game, reaction)
    );
    rollReactionCollector.on('remove', (reaction) =>
      removeBlockedRoll(game, reaction)
    );
  }
};

const createGame = async (message) => {
  if (getGameFrom(message.author.id))
    return sendMessageTo(
      message.channel.id,
      `${message.author}, you are already in a game!`
    );

  console.log(`Creando un nuevo juego. Creador: ${message.author.username}`);
  const game = createEmptyGame(message.author);
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
      game.status === GAME_STATUS.CREATION &&
      startGame(game, gameCreationMessage)
  );
};

const playGame = (message) => sendMessageTo(message.channel.id, 'play game!');

const endGame = (message) => sendMessageTo(message.channel.id, 'game ended');

const addOption = (option) => (message) => {
  const game = getGameFrom(message.author.id);
  if (
    game &&
    game.status === GAME_STATUS.INGAME &&
    isMyTurn(message.author.id, game)
  ) {
    if (!isMyTurn(message.author.id, game))
      return sendMessageTo(
        message.channel.id,
        `${message.author.username}, it is not your turn!`
      );

    if (game.playerTurn.rolledTimes === 0)
      return sendMessageTo(
        message.channel.id,
        `${message.author.username}, you did not roll yet!`
      );

    const result = game.playerTurn.savedDices.map((dice) => dice.diceResult);
    const resultOptions = options(result);

    if (!resultOptions.some((resultOption) => resultOption === option))
      return sendMessageTo(
        message.channel.id,
        `${message.author.username}, that option is not valid!`
      );

    const player = findPlayer(game, message.author.id);
    player.table[option] = calculatePoints(
      option,
      game.playerTurn.savedDices.map((dice) => dice.diceResult),
      game.playerTurn.rolledTimes === 1
    );
  }
};

module.exports = {
  notFound,
  rollDice,
  playGame,
  endGame,
  createGame,
  addOption,
};
