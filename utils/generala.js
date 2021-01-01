const { TABLE_OPTIONS } = require('../constants/tableOptions');

const addNumericDiceOptions = (result, opts) => {
    let numericOptions = [TABLE_OPTIONS.ONES, TABLE_OPTIONS.TWOS, TABLE_OPTIONS.THREES, TABLE_OPTIONS.FOURS, TABLE_OPTIONS.FIVES, TABLE_OPTIONS.SIXES];
    result.forEach(number => {
        const numericActualOption = numericOptions[number - 1];
        const foundOption = opts.find((option) => option.opt === numericActualOption)
        if (!foundOption) {
            opts.push({ opt: numericActualOption, count: 1 });
        } else {
            foundOption.count++
        }
    });
}

const addStraight = (result, opts) => {
    if (opts.length >= 5 && ![1, 2, 6].every((num) => result.includes(num))) opts.push(TABLE_OPTIONS.STRAIGHT);
}

const addRest = (opts, numericOpts) => {
    let two = 0;
    let three = 0;
    const countOptions = {
        1: () => { },
        2: () => two++,
        3: () => three++,
        4: () => opts.push(TABLE_OPTIONS.POKER),
        5: () => opts.push(TABLE_OPTIONS.GENERALA)
    };

    numericOpts.forEach(opt => {
        countOptions[opt.count]();
    });

    if (two && three) {
        opts.push(TABLE_OPTIONS.DOUBLE);
        opts.push(TABLE_OPTIONS.FULL);
    } else if (two > 1) {
        opts.push(TABLE_OPTIONS.DOUBLE);
    }
}

const options = (result) => {
    let numericOpts = [];
    let opts;

    // Agrega opciones numericas (1,2,3,...,6)
    addNumericDiceOptions(result, numericOpts);

    opts = [...numericOpts].map(number => number.opt);

    // Agrega la opcion de Escalera
    addStraight(result, opts);

    // Agrega el resto de las opciones
    addRest(opts, numericOpts);


    return opts;
}

module.exports = { options };
