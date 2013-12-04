
var Schema = require('mongoose').Schema;

var sala_schema = new Schema({
	users: { type: Array, index: true },
	messages: [],
	creation: { type: Date, default: Date.now }
});

module.exports = sala_schema;

// Torpedo consulta
// Sala
// .findOne({'_id': sala_id})
// .select({messages: {$elemMatch: {'_id': message_id}}})
// .exec(function(err, sala) {
//     // Code
// });