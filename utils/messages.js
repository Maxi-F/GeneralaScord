const bot = require('../bot.js')

const createEmbed = (message, embedInfo) => ({
  color: '#0099ff',
  title: 'GeneralaScord',
  description: message,
  ...embedInfo
})

const sendMessageTo = async (channelId, message, embedInfo = {}) => {
  const channel = bot.channels.cache.get(channelId);
  return await channel.send({ embed: createEmbed(message, embedInfo) })
}


module.exports = { sendMessageTo }
