const { roll } = require('../utils/dice');
const { sendMessageTo } = require('../utils/messages');
const { options } = require('../utils/generala')
const { createGameMessage } = require('../models/game');

const notFound = (command, message) => sendMessageTo(message.channel.id, `${command} is not a command.`)

const rollDice = (message)   => {
    let result = roll(5).sort();
    return sendMessageTo(message.channel.id, `rolled dice: ${result}\noptions: ${options(result)}`)
}

const createGame = async (message) => {
  const gameCreationMessage = await createGameMessage(message);
}

const playGame = (message)   => sendMessageTo(message.channel.id, 'play game!')

const endGame = (message)    => sendMessageTo(message.channel.id, 'game ended')

module.exports = { notFound, rollDice, playGame, endGame, createGame }