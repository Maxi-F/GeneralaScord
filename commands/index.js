const { commands } = require("./config");
const { notFound } = require('./commands.js');

module.exports = (command, message) => commands[command] ? commands[command](message) : notFound(command, message);
