const bot = require('../bot.js')

const createEmbed = (message) => ({
  color: '#0099ff',
  title: 'GeneralaScord',
  description: message
})

const sendMessageTo = (channelId, message) => {
  const channel = bot.channels.cache.get(channelId);
  channel.send({ embed: createEmbed(message) })
}


module.exports = { sendMessageTo }