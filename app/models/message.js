
var mongoose = require('mongoose')
	, Schema = mongoose.Schema

var Message = new Schema({
	room_id		: 	{ type: String, index: true },
	user_id		: 	String,
	username	: 	String,
	message 	: 	String,
	created		: 	{ type: Date, default: Date.now }
});

Message.statics = {

	new: function(userlist, attr, callback) {
		var self = this;
		var room_id = '';
		
		for(el in userlist.sort())
			room_id += '$$' + userlist[el];
		if(attr == undefined || attr == null) { attr = {}; console.log('* Warning: Agregando mensaje sin contenido!.'); }
		attr['room_id'] = room_id;

		var room = mongoose.model('room');
		var alert = mongoose.model('alert');
		console.log('\nActualizando datos de la sala.')
		room.update({ room_id: room_id }, { visited: new Date() }, { upsert: true }, function(err, numberAfected, raw) {
			if(err)
				console.log(err);
			console.log('Creando '+ numberAfected + ' salas.');
			// alert.create({ user_id:  });
			console.log('Registrando un nuevo mensaje.');	
			self.create(attr, callback);
		});		
	}

};

mongoose.model('message', Message);
