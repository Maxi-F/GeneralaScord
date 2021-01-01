const {
  endGame,
  playGame,
  rollDice,
  createGame,
  addOption,
} = require('./commands');
const { TABLE_OPTIONS } = require('../constants/tableOptions');

const rollOptionsCommands = Object.assign(
  ...Object.keys(TABLE_OPTIONS).map((optionKey) => ({
    [optionKey.toLowerCase()]: addOption(TABLE_OPTIONS[optionKey]),
  }))
);

const commands = {
  end: endGame,
  play: playGame,
  roll: rollDice,
  create: createGame,
  ...rollOptionsCommands,
};

module.exports = {
  commands,
};
