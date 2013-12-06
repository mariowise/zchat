
var mongoose = require('mongoose')
	, Schema = mongoose.Schema

var usuario_schema = new Schema({
	_id			: 	{ type: String, unique: true, index: true },
	username	: 	String,
	secret		: 	String,
	status		: 	String
});

mongoose.model('user', usuario_schema);
