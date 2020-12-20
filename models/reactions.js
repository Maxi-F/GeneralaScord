const { games, createPlayer } = require('./game');
const { GAME_STATUS } = require('../constants/status');
const { isBot } = require('../utils/bot');

const CREATION_REACTIONS = [
  {
    reaction: "🤚",
    action: (game, reaction) => {
      game.handReactions = reaction.users.cache
      console.log(game.handReactions)
    }
  },
  {
    reaction: "▶",
    action: (game, userId) => { }
  }
]

const creationReactionListener = (game, reaction) => {
  console.log('hello')
  const selectedReaction = CREATION_REACTIONS.find(({ reaction: type }) => reaction.emoji.name === type);
  return game.status === GAME_STATUS.CREATION && selectedReaction && selectedReaction.action(game, reaction)
}

const creationReactionFilter = (reaction, user) => {
  return !isBot(user.id) && CREATION_REACTIONS.some(({ reaction: type }) => reaction.emoji.name === type);
}

module.exports = { creationReactionFilter, creationReactionListener }
