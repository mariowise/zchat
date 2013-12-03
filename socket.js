
var mongoose        = require('mongoose')
  , db_lnk          = 'mongodb://localhost/zchat'
  , db              = mongoose.createConnection(db_lnk)
  , config 			= require('./config/config')['development']
  , crypto 			= require('crypto')

var usuario_schema = require('./app/models/usuario')
  , Usuario = db.model('usuarios', usuario_schema);

var sala_schema = require('./app/models/sala')
  , Sala = db.model('salas', sala_schema);


var io = require('socket.io').listen(config['socket.io'].port, { log: false });
console.log('Soporte para socket.io corriendo en puerto ' + config['socket.io'].port);


var socketsById = {};

io.sockets.on('connection', function(socket) {
	socket.on('i-am', function(chunk) {
		var decipher = crypto.createDecipheriv('aes-128-cbc', 'abcdefghijklmnop', '0123456789123456')
		  , decrypted = decipher.update(chunk.secret, 'hex', 'utf-8');
			decrypted += decipher.final('utf-8');
			chunk.secret = decrypted;
		
		if(chunk.secret == 'zchat_secret') {
			Usuario.update({ _id: chunk.id }, { $set: { username: chunk.username, secret: chunk.secret , status: 'online' }}, {upsert: true}, function(err, numberAfected, raw) {
				if(socketsById[chunk.id] == undefined) {
					socketsById[chunk.id] = { socketList: [] };
					console.log('Usuario "'+ chunk.username +'" conectado a zchat.');
				}
				socketsById[chunk.id].socketList.push(socket);
				socket.broadcast.emit('user-update', { id: chunk.id, username: chunk.username, status: 'online' });
				socket.lid = chunk.id;
				socket.username = chunk.username;
				socket.offset = socketsById[chunk.id].socketList.length-1;
				Usuario.find({}, function(err, docs) { 
					for(var i = 0; i < docs.length; i++) 
						socket.emit('user-update', { id: docs[i]._id, username: docs[i].username, status: docs[i].status });
				});
			});
		}
	});
	socket.on('message-to', function(msg) {
		var from = socket.lid; 
		var to = msg.to;
		Sala.update({ users: [{ id: from }, { id: to }] }, { $push: { messages: [{ from: from, msg: msg.msg }] }}, { upsert: true }, function(err, numberAfected, raw) {
			
		});
	});
	socket.on('disconnect', function() {
		socketsById[socket.lid].socketList.splice(socket.offset, 1);
		if(socketsById[socket.lid].socketList.length == 0) {
			Usuario.update({ _id: socket.lid }, { $set: { status: 'offline' }}, null, function() {
				delete socketsById[socket.lid];
				socket.broadcast.emit('user-update', { id: socket.lid, username: socket.username, status: 'offline' });
				console.log('Usuario "'+ socket.username +'" desconectado de zchat.');
			});
		}
	});
});
