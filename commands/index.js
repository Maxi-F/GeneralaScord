const { commands } = require("./config");
const { notFound } = require('./commandFunctions/notFound');

module.exports = (command, message) => commands[command] ? commands[command](message) : notFound(command, message);
