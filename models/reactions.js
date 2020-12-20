const { games, createPlayer } = require('./game');
const { GAME_STATUS } = require('../constants/status');
const { isBot } = require('../utils/bot');

const CREATION_REACTIONS = [
  {
    reaction: "🤚",
    action: (game, reaction) => {
      game.handReactions = reaction.users.cache.array().map(user => user.id)
      // console.log(game.handReactions)
    }
  },
  {
    reaction: "▶",
    action: (game, reaction) => {
      const newPlayers = game.handReactions
        .filter(userId => !isBot(userId) && userId !== game.creator)
        .map(userId => createPlayer(userId));
      game.players = [...game.players, ...newPlayers]
      game.status = GAME_STATUS.INGAME;
      delete game.handReactions;

      // Modify message that the game has started

      console.log(game)
    }
  }
]

const creationReactionListener = (game, reaction) => {
  console.log(game)
  const selectedReaction = CREATION_REACTIONS.find(({ reaction: type }) => reaction.emoji.name === type);
  return game.status === GAME_STATUS.CREATION && selectedReaction && selectedReaction.action(game, reaction)
}

const creationReactionFilter = (reaction, user) => {
  return !isBot(user.id) && CREATION_REACTIONS.some(({ reaction: type }) => reaction.emoji.name === type);
}

module.exports = { creationReactionFilter, creationReactionListener }
