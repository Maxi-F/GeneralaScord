const bot = require('../bot');

const isBot = (userId) => bot.user.id === userId

module.exports = { isBot }
