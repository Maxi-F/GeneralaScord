const { rollDice, createGame, getTable, addOption } = require('./commands');
const { TABLE_OPTIONS } = require('../constants/tableOptions');

const rollOptionsCommands = Object.assign(
  ...Object.values(TABLE_OPTIONS).map((option) => ({
    [option]: addOption(option),
  }))
);

const commands = {
  tirar: rollDice,
  crear: createGame,
  tabla: getTable,
  ...rollOptionsCommands,
};

module.exports = {
  commands,
};
