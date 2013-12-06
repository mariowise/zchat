
var mongoose = require('mongoose')
	, Schema = mongoose.Schema

var Room = new Schema({
	room_id 	: 	{ type: String, unique: true, index: true },
	visited		: 	{ type: Date, default: Date.now }
});

Room.statics = {

	new: function(userList, callback) {
		var room_id = '';
		for(el in userList.sort())
			room_id += '$$' + userList[el];
		this.create({ room_id: room_id }, callback);
	}

};

mongoose.model('room', Room);

// Torpedo consulta
// Sala
// .findOne({'_id': sala_id})
// .select({messages: {$elemMatch: {'_id': message_id}}})
// .exec(function(err, sala) {
//     // Code
// });