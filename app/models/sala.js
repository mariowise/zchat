
var Schema = require('mongoose').Schema;

var sala_schema = new Schema({
	users: { type: Array, index: true },
	messages: [],
	creation: { type: Date, default: Date.now }
});

module.exports = sala_schema;