const bot = require('../bot');

const isBot = (user) => bot.user.id === user

module.exports = { isBot }
