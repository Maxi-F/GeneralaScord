const roll = (amount) =>
  Array.apply(null, Array(amount)).map(() => Math.floor(Math.random() * 6) + 1);

module.exports = { roll };
