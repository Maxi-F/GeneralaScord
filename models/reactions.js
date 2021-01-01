const { startGame } = require('./game');
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
];

const creationReactionListener = (game, reaction, gameMessage) => {
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

const rollReactionFilter = (turnId) => (reaction, user) => {
  return (
    !isBot(user.id) &&
    turnId === user.id &&
    ROLL_REACTIONS.some((aReaction) => aReaction === reaction.emoji.name)
  );
};

const manageRoll = (value, createMessage) => (game, reaction) => {
  const diceIndex = ROLL_REACTIONS.findIndex(
    (emoji) => reaction.emoji.name === emoji
  );

  // Este if esta solo para asegurar que no este guardado el dado desde antes.
  if (!game.playerTurn.savedDices[diceIndex].fixed) {
    const newEmbed = reaction.message.embeds[0];
    game.playerTurn.savedDices[diceIndex].saved = value;

    // console.log(newEmbed.fields)
    newEmbed.fields[diceIndex].value = createMessage(ROLL_REACTIONS[diceIndex]);
    // newEmbed.fields[diceIndex + 1].name = `Dice ${diceIndex + 1}: \`\`\`${ROLL_REACTIONS[diceIndex]}\`\`\` :white_check_mark:`

    reaction.message.edit(newEmbed);
  }
};

const addBlockedRoll = manageRoll(true, () => 'You are keeping this dice');

const removeBlockedRoll = manageRoll(
  false,
  (dice) => `React with ${dice} to keep the dice!`
);

module.exports = {
  creationReactionFilter,
  creationReactionListener,
  rollReactionFilter,
  addBlockedRoll,
  removeBlockedRoll,
};
