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
  calculateTotalPoints,
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
  sendMessageTo(message.channel.id, `${command} no es un comando.`);

const rollDice = async (message) => {
  const game = getGameFrom(message.author.id);
  if (game && game.status === GAME_STATUS.INGAME) {
    if (!isMyTurn(message.author.id, game))
      return sendMessageTo(
        message.channel.id,
        `${message.author.username}, no es tu turno!`
      );

    if (game.playerTurn.rolledTimes === 3)
      return sendMessageTo(
        message.channel.id,
        `${message.author.username}, ya tiraste 3 veces.`
      );

    const playerDices = game.playerTurn.savedDices;

    if (playerDices.every((dice) => dice.saved))
      return sendMessageTo(
        message.channel.id,
        `${message.author.username}, no agarraste ningun dado!`
      );

    let result = roll(5);
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
      [...result].sort(),
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
      { idle: 180000, dispose: true }
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
      `${message.author}, ya estas en una partida!`
    );

  console.log(`Creando un nuevo juego. Creador: ${message.author.username}`);
  const game = createEmptyGame(message.author);
  const gameCreationMessage = await sendGameMessage(message);
  const creationCollector = gameCreationMessage.createReactionCollector(
    creationReactionFilter,
    { time: 120000 }
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
    return sendActualTable(player, message, calculateTotalPoints(player));
  } else {
    return sendNotInGame(message);
  }
};

const addOption = (option) => (message) => {
  const game = getGameFrom(message.author.id);
  if (game && game.status === GAME_STATUS.INGAME) {
    if (!isMyTurn(message.author.id, game))
      return sendMessageTo(
        message.channel.id,
        `${message.author.username}, no es tu turno!`
      );

    if (game.playerTurn.rolledTimes === 0)
      return sendMessageTo(
        message.channel.id,
        `${message.author.username}, no tiraste todavía!`
      );

    const result = game.playerTurn.savedDices.map((dice) => dice.diceResult);
    const resultOptions = options(
      [...result].sort(),
      usedOptions(game, message.author.id)
    );

    const player = findPlayer(game, message.author.id);

    if (player.table[option] !== undefined)
      return sendMessageTo(
        message.channel.id,
        `${message.author.username}, esa opción no es válida! Ya está tachada o utilizada.`
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
