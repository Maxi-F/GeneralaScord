const {
  rollDice,
  createGame,
  getTable,
  addOption,
  leaveGame,
} = require('./commands');
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
  salir: leaveGame,
  ...rollOptionsCommands,
};

module.exports = {
  commands,
};
