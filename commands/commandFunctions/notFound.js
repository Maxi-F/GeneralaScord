const { sendMessageTo } = require('../../utils/messages');

const notFound = (command, message) => sendMessageTo(message.channel.id, `${command} is not a command.`)

module.exports = { notFound }