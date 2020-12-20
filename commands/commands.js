const { roll } = require('../utils/dice');
const { sendMessageTo, sendGameMessage, sendRollMessage } = require('../utils/messages');
const { options } = require('../utils/generala');
const { createEmptyGame, startGame, getGameFrom } = require('../models/game');
const { creationReactionListener, creationReactionFilter, rollReactionFilter, addBlockedRoll, removeBlockedRoll } = require('../models/reactions');
const { GAME_STATUS } = require('../constants/status');

const notFound = (command, message) => sendMessageTo(message.channel.id, `${command} is not a command.`)

const rollDice = async (message) => {
  const game = getGameFrom(message.author.id);
  if(game && game.status === GAME_STATUS.INGAME) {
    let result = roll(5).sort();
    let resultOptions = options(result);

    const rollMessage = await sendRollMessage(message, game, result, resultOptions)
    
    const rollReactionCollector = rollMessage.createReactionCollector(rollReactionFilter, { idle: 60000, dispose: true });
  
    rollReactionCollector.on('collect', reaction => addBlockedRoll(game, reaction));
    rollReactionCollector.on('remove', reaction => removeBlockedRoll(game, reaction));
  }
}

const createGame = async (message) => {
  if(getGameFrom(message.author.id)) return sendMessageTo(message.channel.id, `${message.author}, you are already in a game!`);
  
  console.log(`Creando un nuevo juego. Creador: ${message.author.username}`)
  const game = createEmptyGame(message.author);
  const gameCreationMessage = await sendGameMessage(message);
  const creationCollector = gameCreationMessage.createReactionCollector(creationReactionFilter, { time: 40000 });

  creationCollector.on('collect', reaction => creationReactionListener(game, reaction, gameCreationMessage))
  creationCollector.on('end', () => game.status === GAME_STATUS.CREATION && startGame(game, gameCreationMessage))
}

const playGame = (message) => sendMessageTo(message.channel.id, 'play game!')

const endGame = (message) => sendMessageTo(message.channel.id, 'game ended')

module.exports = { notFound, rollDice, playGame, endGame, createGame }
