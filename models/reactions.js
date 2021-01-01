const { startGame } = require('./game');
const { GAME_STATUS } = require('../constants/status');
const { isBot } = require('../utils/bot');
const { ROLL_REACTIONS } = require('../constants/reactions');
const { createEmbed } = require('../utils/messages');
const bot = require('../bot');

const CREATION_REACTIONS = [
  {
    reaction: "🤚",
    action: (game, gameMessage, reaction) => {
      game.handReactions = reaction.users.cache.array()
      console.log(`Jugadores: ${game.handReactions.map(player => player.username)}`)
    }
  },
  {
    reaction: "▶",
    action: startGame
  }
]

const creationReactionListener = (game, reaction, gameMessage) => {
  const selectedReaction = CREATION_REACTIONS.find(({ reaction: type }) => reaction.emoji.name === type);
  return game.status === GAME_STATUS.CREATION && selectedReaction && selectedReaction.action(game, gameMessage, reaction)
}

const creationReactionFilter = (reaction, user) => {
  return !isBot(user.id) && CREATION_REACTIONS.some(({ reaction: type }) => reaction.emoji.name === type);
}

const rollReactionFilter = (turnId) => (reaction, user) => {
  return !isBot(user.id) && turnId === user.id && ROLL_REACTIONS.some(aReaction => aReaction === reaction.emoji.name);
}

const addBlockedRoll = (game, reaction) => {
  // console.log(reaction.message.embeds);
  const diceIndex = ROLL_REACTIONS.findIndex(emoji => reaction.emoji.name === emoji);
  
  // Este if esta solo para asegurar que no este guardado el dado desde antes.
  if(!game.playerTurn.savedDices[diceIndex].fixed) {
    const newEmbed = reaction.message.embeds[0];
    game.playerTurn.savedDices[diceIndex].saved = true;

    // console.log(newEmbed.fields)
    newEmbed.fields[diceIndex + 1].value = "You are keeping this dice" 
    // newEmbed.fields[diceIndex + 1].name = `Dice ${diceIndex + 1}: \`\`\`${ROLL_REACTIONS[diceIndex]}\`\`\` :white_check_mark:`
    console.log(game)
    reaction.message.edit(newEmbed)
  }
}

const removeBlockedRoll = (game, reaction) => {
  const diceIndex = ROLL_REACTIONS.findIndex(emoji => reaction.emoji.name === emoji)

  if(!game.playerTurn.savedDices[diceIndex].fixed) {
    const newEmbed = reaction.message.embeds[0]
    game.playerTurn.savedDices[diceIndex].saved = false;

    // console.log(newEmbed.fields)
    newEmbed.fields[diceIndex + 1].value = `React with ${ROLL_REACTIONS[diceIndex]} to keep the dice!`
    // newEmbed.fields[diceIndex + 1].name = `Dice ${diceIndex + 1}: \`\`\`${ROLL_REACTIONS[diceIndex]}\`\`\``

    console.log(game)
    reaction.message.edit(newEmbed)
  }
}

module.exports = { creationReactionFilter, creationReactionListener, rollReactionFilter, addBlockedRoll, removeBlockedRoll }