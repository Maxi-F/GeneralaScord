const bot = require('../bot.js');
const { ROLL_REACTIONS, ROLL_LETTERS } = require('../constants/reactions.js');
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

const sendNotInGame = (message) =>
  sendMessageTo(
    message.channel.id,
    `${message.author}, no estas en una partida!`
  );

const sendTurnMessage = (channelId, player) =>
  sendMessageTo(channelId, `Próximo turno: ${player}`);

const sendGameMessage = async (message) => {
  const gameCreationMessage = await sendMessageTo(
    message.channel.id,
    `${message.author.username} está creando una partida!`,
    {
      fields: [
        {
          name: 'Unite al juego!',
          value: 'Unite con 🤚',
        },
        {
          name: 'Empeza el juego!',
          value: 'Empezalo con ▶',
        },
        {
          name: 'Cancelar creación',
          value: 'Cancelá con 🔴',
        },
      ],
    }
  );
  gameCreationMessage.react('🤚');
  gameCreationMessage.react('▶');
  gameCreationMessage.react('🔴');
  return gameCreationMessage;
};

const sendActualTable = (player, message, totalPoints) => {
  return message.author.send({
    embed: createEmbed('Aca esta tu tabla!', {
      fields: [
        ...Object.entries(player.table).map(([option, value]) => ({
          name: option,
          value: value === undefined ? 'No fue usado todavia!' : value,
        })),
        {
          name: 'Puntos totales:',
          value: `\`\`\`${totalPoints}\`\`\``,
        },
      ],
    }),
  });
};

const sendGameEndMessage = (message, gameTable) =>
  sendMessageTo(
    message.channel.id,
    `Terminó la partida! ${gameTable[0].user} ha ganado!`,
    {
      fields: gameTable.map((player) => ({
        name: `Puntos totales de ${player.user.username}:`,
        value: player.points,
      })),
    }
  );

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
    `${game.playerTurn.user} tiro los dados! Cantidad de veces tiradas: ${game.playerTurn.rolledTimes}`,
    {
      fields: [
        ...result.map((val, index) => ({
          name: `Dado ${ROLL_LETTERS[index]}: \`\`\`${val}\`\`\` `,
          value: `Reaccioná con ${ROLL_REACTIONS[index]} para agarrar el dado!`,
          // inline: true
        })),
        {
          name:
            'Opciones para usar (usá &<opción> para utilizar la opción correspondiente)',
          value: useOptions ? useOptions : 'No hay opciones para usar!',
        },
        {
          name:
            'Opciones para tachar (usá &<opción> para tachar la opción deseada)',
          value: crossOptions ? crossOptions : 'No hay opciones para tachar!',
        },
      ],
    }
  );
  return rollMessage;
};

const reactNumbers = (message) => {
  ROLL_REACTIONS.forEach(async (reaction) => {
    await message.react(reaction);
  });
};

module.exports = {
  sendMessageTo,
  createEmbed,
  sendTurnMessage,
  sendActualTable,
  sendGameMessage,
  sendNotInGame,
  sendGameEndMessage,
  sendRollMessage,
  reactNumbers,
};
