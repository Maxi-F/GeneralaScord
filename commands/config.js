const { endGame, playGame, rollDice } = require('./commands');

const commands = {
  end: endGame,
  play: playGame,
  roll: rollDice
};

module.exports = {
  commands
};
