const {
  endGame,
  playGame,
  rollDice,
  createGame,
  getTable,
  addOption,
} = require('./commands');
const { TABLE_OPTIONS } = require('../constants/tableOptions');

const rollOptionsCommands = Object.assign(
  ...Object.values(TABLE_OPTIONS).map((option) => ({
    [option]: addOption(option),
  }))
);

const commands = {
  end: endGame,
  play: playGame,
  roll: rollDice,
  create: createGame,
  table: getTable,
  ...rollOptionsCommands,
};

module.exports = {
  commands,
};
