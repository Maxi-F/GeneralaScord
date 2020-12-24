const { endGame, playGame, rollDice, createGame } = require('./commands');

const commands = {
  end: endGame,
  play: playGame,
  roll: rollDice,
  create: createGame,
};

module.exports = {
  commands,
};
