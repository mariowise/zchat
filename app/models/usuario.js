
var Schema = require('mongoose').Schema;

var usuario_schema = new Schema({
	_id			: 	{ type: String, unique: true, index: true },
	username	: 	{ type: String, unique: true, index: true },
	secret		: 	String,
	status		: 	String
});

module.exports = usuario_schema;