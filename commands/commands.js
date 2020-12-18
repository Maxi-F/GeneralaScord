const { sendMessageTo } = require('../utils/messages');

const notFound = (command, message) => sendMessageTo(message.channel.id, `${command} is not a command.`)

const rollDice = (message) => sendMessageTo(message.channel.id, 'rolled dice!')

const playGame = (message) => sendMessageTo(message.channel.id, 'play game!')

const endGame = (message) => sendMessageTo(message.channel.id, 'game ended')

module.exports = { notFound, rollDice, playGame, endGame }