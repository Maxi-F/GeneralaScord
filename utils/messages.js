const bot = require('../bot.js')

const createEmbed = (message, embedInfo) => ({
  color: '#0099ff',
  title: 'GeneralaScord',
  description: message,
  ...embedInfo
})

const sendMessageTo = (channelId, message, embedInfo = {}) => {
  const channel = bot.channels.cache.get(channelId);
  return channel.send({ embed: createEmbed(message, embedInfo) })
}


module.exports = { sendMessageTo }
