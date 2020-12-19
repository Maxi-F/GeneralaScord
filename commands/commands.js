const { roll } = require('../utils/dice');
const { sendMessageTo } = require('../utils/messages');

const notFound = (command, message) => sendMessageTo(message.channel.id, `${command} is not a command.`)

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

const addDouble = (result, opts) => {

}

const options = (result)     => {
    let numericOpts = [];
    let opts;
    
    // Agrega opciones numericas (1,2,3,...,6)
    addNumericDiceOptions(result, numericOpts);

    opts = [...numericOpts].map(number => number.opt);  

    // Agrega la opcion de Escalera
    addStraight(result, opts);
    
    // Agrega opcion de doble
    addDouble(opts, numericOpts);



    return opts;
}

const rollDice = (message)   => {
    let result = roll(5).sort();
    return sendMessageTo(message.channel.id, `rolled dice: ${result}\noptions: ${options(result)}`)
}

const createGame = (message) => sendMessageTo(message.channel.id, 'Hello and welcome to GeneralaScord!\n its fun very good lmao REACT WITH POGGERS')

const playGame = (message)   => sendMessageTo(message.channel.id, 'play game!')

const endGame = (message)    => sendMessageTo(message.channel.id, 'game ended')

module.exports = { notFound, rollDice, playGame, endGame, createGame }