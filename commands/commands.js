const { roll } = require('../utils/dice');
const { sendMessageTo } = require('../utils/messages');
const { options } = require('../utils/generala')
const { sendGameMessage, createEmptyGame } = require('../models/game');
const { creationReactionListener, creationReactionFilter } = require('../models/reactions');

const notFound = (command, message) => sendMessageTo(message.channel.id, `${command} is not a command.`)

const rollDice = (message)   => {
    let result = roll(5).sort();
    return sendMessageTo(message.channel.id, `rolled dice: ${result}\noptions: ${options(result)}`)
}

const createGame = async (message) => {
  const game = createEmptyGame(message.author.id);
  const gameCreationMessage = await sendGameMessage(message);
  const creationCollector = gameCreationMessage.createReactionCollector(creationReactionFilter, { time: 40000 });
  creationCollector.on('collect', reaction => creationReactionListener(game, reaction))
}

const playGame = (message)   => sendMessageTo(message.channel.id, 'play game!')

const endGame = (message)    => sendMessageTo(message.channel.id, 'game ended')

module.exports = { notFound, rollDice, playGame, endGame, createGame }