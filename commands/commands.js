const { roll } = require('../utils/dice');
const {
  sendMessageTo,
  sendGameMessage,
  sendRollMessage,
  reactNumbers,
  sendTurnMessage,
  sendActualTable,
  sendGameEndMessage,
  sendNotInGame,
} = require('../utils/messages');
const { options, calculatePoints } = require('../utils/generala');
const {
  createEmptyGame,
  startGame,
  getGameFrom,
  isMyTurn,
  findPlayer,
  usedOptions,
  passTurn,
  isGameFinished,
  calculateFinishedGameTable,
} = require('../models/game');
const {
  creationReactionListener,
  creationReactionFilter,
  rollReactionFilter,
  addBlockedRoll,
  removeBlockedRoll,
} = require('../models/reactions');
const { GAME_STATUS } = require('../constants/status');
const { TABLE_OPTIONS } = require('../constants/tableOptions');

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

    const playerDices = game.playerTurn.savedDices;

    if (playerDices.every((dice) => dice.saved))
      return sendMessageTo(
        message.channel.id,
        `${message.author.username}, no agarraste ningun dado!`
      );

    let result = roll(5).sort();
    game.playerTurn.rolledTimes++;

    game.playerTurn.savedDices.forEach((dice, index) => {
      if (!dice.saved) {
        dice.diceResult = result[index];
        dice.saved = true;
      } else {
        result[index] = dice.diceResult;
      }
    });

    const usedOpts = usedOptions(game, message.author.id);
    let resultOptions = options(
      result,
      usedOpts,
      findPlayer(game, message.author.id).table[TABLE_OPTIONS.GENERALA]
    );

    const rollMessage = await sendRollMessage(
      message,
      game,
      result,
      resultOptions,
      usedOpts
    );

    // console.log(rollMessage.embeds[0])

    const rollReactionCollector = rollMessage.createReactionCollector(
      rollReactionFilter(message.author.id, game.playerTurn.rolledTimes),
      { idle: 60000, dispose: true }
    );

    reactNumbers(rollMessage, game);

    rollReactionCollector.on('collect', (reaction) =>
      removeBlockedRoll(game, reaction)
    );
    rollReactionCollector.on('remove', (reaction) =>
      addBlockedRoll(game, reaction)
    );
  } else {
    return sendNotInGame(message);
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

const getTable = (message) => {
  const game = getGameFrom(message.author.id);
  if (game && game.status === GAME_STATUS.INGAME) {
    const player = findPlayer(game, message.author.id);
    return sendActualTable(player, message);
  } else {
    return sendNotInGame(message);
  }
};

const playGame = (message) => sendMessageTo(message.channel.id, 'play game!');

const endGame = (message) => sendMessageTo(message.channel.id, 'game ended');

const addOption = (option) => (message) => {
  const game = getGameFrom(message.author.id);
  if (game && game.status === GAME_STATUS.INGAME) {
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
    const resultOptions = options(result, usedOptions(game, message.author.id));

    const player = findPlayer(game, message.author.id);

    if (player.table[option] !== undefined)
      return sendMessageTo(
        message.channel.id,
        `${message.author.username}, that option is not valid!`
      );

    if (!resultOptions.some((resultOption) => resultOption === option)) {
      player.table[option] = 0;
    } else {
      player.table[option] = calculatePoints(
        option,
        game.playerTurn.savedDices.map((dice) => dice.diceResult),
        game.playerTurn.rolledTimes === 1
      );
    }

    if (isGameFinished(game)) {
      const gameTable = calculateFinishedGameTable(game);
      game.status = GAME_STATUS.FINISHED;
      return sendGameEndMessage(message, gameTable);
    }

    passTurn(game, player);
    return sendTurnMessage(message.channel.id, game.playerTurn.user);
  } else {
    return sendNotInGame(message);
  }
};

module.exports = {
  notFound,
  rollDice,
  playGame,
  endGame,
  createGame,
  getTable,
  addOption,
};
