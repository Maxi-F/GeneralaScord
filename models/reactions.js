const { startGame } = require('./game');
const { GAME_STATUS } = require('../constants/status');
const { isBot } = require('../utils/bot');
const { ROLL_REACTIONS } = require('../constants/reactions');

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
  return turnId === user.id && !isBot(user.id) && ROLL_REACTIONS.some(aReaction => aReaction === reaction.emoji.name);
}

const addBlockedRoll = (game, reaction) => {

}

const removeBlockedRoll = (game, reaction) => {

}

module.exports = { creationReactionFilter, creationReactionListener, rollReactionFilter, addBlockedRoll, removeBlockedRoll }