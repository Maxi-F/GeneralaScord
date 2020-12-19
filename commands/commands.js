const { roll } = require('../utils/dice');
const { sendMessageTo } = require('../utils/messages');
const { options } = require('../utils/generala')

const notFound = (command, message) => sendMessageTo(message.channel.id, `${command} is not a command.`)

const rollDice = (message)   => {
    let result = roll(5).sort();
    return sendMessageTo(message.channel.id, `rolled dice: ${result}\noptions: ${options(result)}`)
}

const createGame = (message) => sendMessageTo(message.channel.id, 'Hello and welcome to GeneralaScord!\n its fun very good lmao REACT WITH POGGERS')

const playGame = (message)   => sendMessageTo(message.channel.id, 'play game!')

const endGame = (message)    => sendMessageTo(message.channel.id, 'game ended')

module.exports = { notFound, rollDice, playGame, endGame, createGame }