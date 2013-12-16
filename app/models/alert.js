
var mongoose = require('mongoose')
	, Schema = mongoose.Schema

var Alert = new Schema({
	user_id 	: 	{ type: String, index: true }, 	// Alert addresse
	peer_id 	: 	{ type: String, index: true }, 	// Alert creator
	cant 		: 	{ type: Number, default: 0 }
});

Alert.statics = {

	

};

mongoose.model('alert', Alert);