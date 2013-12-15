
var mongoose = require('mongoose')
	, Schema = mongoose.Schema

var Alert = new Schema({
	user_id 	: 	{ type: String, index: true }, // Alert owner
	peer_id 	: 	{ type: String, index: true }, // Alert trigger
	msg_id 		: 	{ type: String, index: true }, // Message id
	created 	: 	{ type: Date, default: Date.now }
});

Alert.statics = {

	

};

mongoose.model('alert', Alert);