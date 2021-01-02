const bot = require('../bot.js');
const { ROLL_REACTIONS } = require('../constants/reactions.js');
const { TABLE_OPTIONS } = require('../constants/tableOptions.js');
const { calculatePoints } = require('./generala.js');

const createEmbed = (message, embedInfo) => ({
  color: '#0099ff',
  title: 'GeneralaScord',
  description: message,
  ...embedInfo,
});

const sendMessageTo = (channelId, message, embedInfo = {}) => {
  const channel = bot.channels.cache.get(channelId);
  return channel.send({ embed: createEmbed(message, embedInfo) });
};

const sendTurnMessage = (channelId, player) =>
  sendMessageTo(channelId, `Next turn: ${player}`);

const sendGameMessage = async (message) => {
  const gameCreationMessage = await sendMessageTo(
    message.channel.id,
    `${message.author.username} is creating a game!`,
    {
      fields: [
        {
          name: 'Join the game!',
          value: 'React with 🤚',
          inline: true,
        },
        {
          name: '\u200b',
          value: '\u200b',
          inline: true,
        },
        {
          name: 'Start the game!',
          value: 'Start with ▶',
          inline: true,
        },
      ],
    }
  );
  gameCreationMessage.react('🤚');
  gameCreationMessage.react('▶');
  return gameCreationMessage;
};

const sendRollMessage = async (message, game, result, options, usedOptions) => {
  const useOptions = options
    .map(
      (option) =>
        `${option} (${calculatePoints(
          option,
          result,
          game.playerTurn.rolledTimes === 1
        )})`
    )
    .join(', ');

  const crossOptions = Object.values(TABLE_OPTIONS)
    .filter(
      (anOption) =>
        ![...options, ...usedOptions].some((option) => option === anOption)
    )
    .join(', ');

  const rollMessage = await sendMessageTo(
    message.channel.id,
    `${game.playerTurn.user} rolled!`,
    {
      fields: [
        ...result.map((val, index) => ({
          name: `Dice ${index + 1}: \`\`\`${val}\`\`\` `,
          value: game.playerTurn.savedDices[index].fixed
            ? 'This dice is fixed'
            : `React with ${ROLL_REACTIONS[index]} to keep the dice!`,
          // inline: true
        })),
        {
          name:
            'Options to use (react with &<option> to use the desired option)',
          value: useOptions ? useOptions : 'There are no options to use!',
        },
        {
          name:
            'Options to cross out (react with &<option> to cross out the desired option)',
          value: crossOptions ? crossOptions : 'There are no options to cross!',
        },
      ],
    }
  );
  return rollMessage;
};

const reactNumbers = (message, game) => {
  ROLL_REACTIONS.forEach(async (reaction, index) => {
    if (!game.playerTurn.savedDices[index].saved) await message.react(reaction);
  });
};

module.exports = {
  sendMessageTo,
  createEmbed,
  sendTurnMessage,
  sendGameMessage,
  sendRollMessage,
  reactNumbers,
};
