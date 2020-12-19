const addNumericDiceOptions = (result, opts) => {
    let numericOptions = ["unos", "doses", "treses", "cuatros", "cincos", "seises"];
    result.forEach(number => {
        const numericActualOption = numericOptions[number - 1];
        const foundOption = opts.find((option) => option.opt === numericActualOption) 
        if(!foundOption) {
            opts.push({opt: numericActualOption, count: 1});
        } else {
            foundOption.count++
        }
    });
}

const addStraight = (result, opts) => {
    if (opts.length >= 5 && ![1,2,6].every((num) => result.includes(num))) opts.push("Escalera"); // banana
}

const addRest = (opts, numericOpts) => {
    let two = 0;
    let three = 0;
    const turbio = {
        1: () => {},
        2: () => two++,
        3: () => three++,
        4: () => opts.push("Poker"),
        5: () => opts.push("Generala")
    };
    
    numericOpts.forEach(opt => {
        turbio[opt.count]();
    });

    if (two && three) {
        opts.push("Doble");
        opts.push("Full");
    } else if (two > 1) {
        opts.push("Doble");
    }
}

const options = (result)     => {
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