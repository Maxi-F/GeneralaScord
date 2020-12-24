const { startGame } = require('./game');
const { GAME_STATUS } = require('../constants/status');
const { isBot } = require('../utils/bot');

const CREATION_REACTIONS = [
  {
    reaction: '🤚',
    action: (game, gameMessage, reaction) => {
      game.handReactions = reaction.users.cache.array();
      // console.log(game.handReactions)
    },
  },
  {
    reaction: '▶',
    action: startGame,
  },
];

const creationReactionListener = (game, reaction, gameMessage) => {
  console.log(game);
  const selectedReaction = CREATION_REACTIONS.find(
    ({ reaction: type }) => reaction.emoji.name === type
  );
  return (
    game.status === GAME_STATUS.CREATION &&
    selectedReaction &&
    selectedReaction.action(game, gameMessage, reaction)
  );
};

const creationReactionFilter = (reaction, user) => {
  return (
    !isBot(user.id) &&
    CREATION_REACTIONS.some(
      ({ reaction: type }) => reaction.emoji.name === type
    )
  );
};

module.exports = { creationReactionFilter, creationReactionListener };
