const bot = require('../bot.js')

const sendMessageTo = (channelId, message) => {
  const channel = bot.channels.cache.get(channelId);
  channel.send(message)
}


module.exports = { sendMessageTo }