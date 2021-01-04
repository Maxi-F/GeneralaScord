const { TABLE_OPTIONS } = require('../constants/tableOptions');

const addNumericDiceOptions = (result, opts) => {
  let numericOptions = [
    TABLE_OPTIONS.ONES,
    TABLE_OPTIONS.TWOS,
    TABLE_OPTIONS.THREES,
    TABLE_OPTIONS.FOURS,
    TABLE_OPTIONS.FIVES,
    TABLE_OPTIONS.SIXES,
  ];
  result.forEach((number) => {
    const numericActualOption = numericOptions[number - 1];
    const foundOption = opts.find(
      (option) => option.opt === numericActualOption
    );
    if (!foundOption) {
      opts.push({ opt: numericActualOption, count: 1 });
    } else {
      foundOption.count++;
    }
  });
};

const addStraight = (result, opts) => {
  if (opts.length >= 5 && ![1, 2, 6].every((num) => result.includes(num)))
    opts.push(TABLE_OPTIONS.STRAIGHT);
};

const addRest = (opts, numericOpts, hasGenerala) => {
  let two = 0;
  let three = 0;
  const countOptions = {
    1: () => {},
    2: () => two++,
    3: () => three++,
    4: () => opts.push(TABLE_OPTIONS.POKER),
    5: () => {
      if (hasGenerala) {
        opts.push(TABLE_OPTIONS.DOUBLE_GENERALA);
      } else {
        opts.push(TABLE_OPTIONS.GENERALA);
      }
    },
  };

  numericOpts.forEach((opt) => {
    countOptions[opt.count]();
  });

  if (two && three) {
    opts.push(TABLE_OPTIONS.DOUBLE);
    opts.push(TABLE_OPTIONS.FULL);
  } else if (two > 1) {
    opts.push(TABLE_OPTIONS.DOUBLE);
  }
};

const options = (result, usedOpts, hasGenerala) => {
  let numericOpts = [];
  let opts;

  // Agrega opciones numericas (1,2,3,...,6)
  addNumericDiceOptions(result, numericOpts);

  opts = [...numericOpts].map((number) => number.opt);

  // Agrega la opcion de Escalera
  addStraight(result, opts);

  // Agrega el resto de las opciones
  addRest(opts, numericOpts, hasGenerala);

  return opts.filter((opt) => !usedOpts.some((anUsedOpt) => anUsedOpt === opt));
};

const summatoryOf = (number) => (dices) =>
  dices.reduce((acum, curr) => (curr === number ? acum + curr : acum), 0);

const calculateServed = (pointsIfServed, pointsIfNotServed) => (_, isServed) =>
  isServed ? pointsIfServed : pointsIfNotServed;

const calculatePoints = (option, dices, isServed) => {
  const pointsPerOption = {
    [TABLE_OPTIONS.ONES]: summatoryOf(1),
    [TABLE_OPTIONS.TWOS]: summatoryOf(2),
    [TABLE_OPTIONS.THREES]: summatoryOf(3),
    [TABLE_OPTIONS.FOURS]: summatoryOf(4),
    [TABLE_OPTIONS.FIVES]: summatoryOf(5),
    [TABLE_OPTIONS.SIXES]: summatoryOf(6),
    [TABLE_OPTIONS.DOUBLE]: calculateServed(15, 10),
    [TABLE_OPTIONS.STRAIGHT]: calculateServed(25, 20),
    [TABLE_OPTIONS.FULL]: calculateServed(35, 30),
    [TABLE_OPTIONS.POKER]: calculateServed(45, 40),
    [TABLE_OPTIONS.GENERALA]: () => 50,
    [TABLE_OPTIONS.DOUBLE_GENERALA]: () => 60,
  }[option];

  return pointsPerOption(dices, isServed);
};

module.exports = { options, calculatePoints };
