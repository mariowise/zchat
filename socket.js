
var mongoose        = require('mongoose')
  , config 			= require('./config/config')['development']
  , crypto 			= require('crypto')

var Usuario 	= 	mongoose.model('user'),
	Sala 		=	mongoose.model('room'),
	Message 	= 	mongoose.model('message'),
	Alert 		= 	mongoose.model('alert')

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
			Usuario.update({ _id: chunk.id }, { $set: { username: chunk.username, secret: chunk.secret , status: 'online' } }, { upsert: true }, function(err, numberAfected, raw) {
				if(socketsById[chunk.id] == undefined) {
					socketsById[chunk.id] = { socketList: [] };
					console.log('Usuario "'+ chunk.username +'" conectado a zchat.');
				}
				socketsById[chunk.id].socketList.push(socket);
				socket.broadcast.emit('user-update', { id: chunk.id, username: chunk.username, status: 'online' });
				socket.lid 		= 	chunk.id;
				socket.username = 	chunk.username;
				socket.offset 	= 	socketsById[chunk.id].socketList.length-1;
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

		Message.new([from, to], { user_id: socket.lid, username: socket.username, message: msg.msg }, function() {			
			console.log('  mensaje '+ from + ' -> '+ to +' : '+ msg.msg);
			for(var i = 0; i < socketsById[from].socketList.length; i++)
				socketsById[from].socketList[i].emit('message-from', { from: { id: socket.lid, username: socket.username }, msg: msg.msg });
			if(socketsById[to] != undefined)
				for(var i = 0; i < socketsById[to].socketList.length; i++)
					socketsById[to].socketList[i].emit('message-from', { from: { id: socket.lid, username: socket.username }, msg: msg.msg });
		});
	});
	socket.on('message-get', function(peer) {
		var userlist = [];
		var room_id = '';
		userlist.push(socket.lid);
		for(p in peer)
			userlist.push(peer[p]);
		for(el in userlist.sort())
			room_id += '$$' + userlist[el];

		console.log('Buscando la conversación '+ room_id);
		Message.find({ room_id: room_id }).sort('-created').limit(30).exec(function(err, docs) {
			console.log('  se encontraron '+ docs.length +' mensajes.');
			socket.emit('conversation-flush', { peer: peer, conv: docs });
		});
	});
	socket.on('disconnect', function() {
		if(socketsById[socket.lid] != undefined) {
			socketsById[socket.lid].socketList.splice(socket.offset, 1);
			if(socketsById[socket.lid].socketList.length == 0) {
				Usuario.update({ _id: socket.lid }, { $set: { status: 'offline' }}, null, function() {
					delete socketsById[socket.lid];
					socket.broadcast.emit('user-update', { id: socket.lid, username: socket.username, status: 'offline' });
					console.log('Usuario "'+ socket.username +'" desconectado de zchat.');
				});
			}
		}
	});
});
