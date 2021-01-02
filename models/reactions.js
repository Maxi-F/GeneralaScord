const { startGame, getGameFrom, stopCreation } = require('./game');
const { GAME_STATUS } = require('../constants/status');
const { isBot } = require('../utils/bot');
const { ROLL_REACTIONS } = require('../constants/reactions');

const CREATION_REACTIONS = [
  {
    reaction: '🤚',
    action: (game, gameMessage, reaction) => {
      game.handReactions = reaction.users.cache.array();
      console.log(
        `Jugadores: ${game.handReactions.map((player) => player.username)}`
      );
    },
  },
  {
    reaction: '▶',
    action: startGame,
  },
  {
    reaction: '🔴',
    action: stopCreation,
  },
];

const creationReactionListener = (game, reaction, gameMessage) => {
  const selectedReaction = CREATION_REACTIONS.find(
    ({ reaction: type }) => reaction.emoji.name === type
  );
  console.log(game);
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

const rollReactionFilter = (turnId, rolledTimes) => (reaction, user) => {
  return (
    !isBot(user.id) &&
    turnId === user.id &&
    ROLL_REACTIONS.some((aReaction) => aReaction === reaction.emoji.name) &&
    getGameFrom(turnId).playerTurn.rolledTimes === rolledTimes
  );
};

const manageRoll = (value, createMessage) => (game, reaction) => {
  const diceIndex = ROLL_REACTIONS.findIndex(
    (emoji) => reaction.emoji.name === emoji
  );

  const newEmbed = reaction.message.embeds[0];
  game.playerTurn.savedDices[diceIndex].saved = value;

  // console.log(newEmbed.fields)
  newEmbed.fields[diceIndex].value = createMessage(ROLL_REACTIONS[diceIndex]);
  // newEmbed.fields[diceIndex + 1].name = `Dice ${diceIndex + 1}: \`\`\`${ROLL_REACTIONS[diceIndex]}\`\`\` :white_check_mark:`

  reaction.message.edit(newEmbed);
};

const removeBlockedRoll = manageRoll(
  false,
  () => 'Dado seleccionado! usá &roll para tirar de nuevo este dado.'
);

const addBlockedRoll = manageRoll(
  true,
  (dice) => `Reaccioná con ${dice} para agarrar el dado!`
);

module.exports = {
  creationReactionFilter,
  creationReactionListener,
  rollReactionFilter,
  addBlockedRoll,
  removeBlockedRoll,
};
