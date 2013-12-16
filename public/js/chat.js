


/**
 * ChatWindow
*/
function chatWindow(_id, _title, _socket) {
	this.id = _id
	this.title = _title;
	this.socket = _socket;
	this.room = undefined;
	this.messages = [];
	this.domObj = undefined;
	
	this.barlist[this.id] = this;
	this.barlist.count++;
}
chatWindow.prototype.barlist = { count: 0 };
chatWindow.prototype.messageHandlers = {};
chatWindow.prototype.create = function(holder) {
	var self = this;
	var newOne = document.createElement('div');
	this.domObj = newOne;
	$(newOne).attr('name', this.id);
	$(newOne).attr('class', 'chat-window');
	$(newOne).html('<i class="fa-times"></i><div class="header">'+ this.title +'</div><div class="body"><div></div></div><div class="actions"><textarea></textarea></div>');
	$(holder).append(newOne);
	$($($(newOne).children('.actions')[0]).children('textarea')[0]).keypress(function(e) {
		if(e.keyCode == 13 && !e.shiftKey) {
			e.preventDefault();
			if($(this).val() != '' && $(this).val() != '↵') {
				var msg = { to: self.id, msg: $(this).val() };
				console.log(msg);
				if(socket != undefined) {
					socket.emit('message-to', msg);
					self.pushMessage({ from: { id: socket.lid, username: socket.username}, msg: msg.msg });
					$(this).val('');
				} else
				alert('* Error: No se ha podido enviar el mensaje');
			} else 
				$(this).val('');			
		}
	});
	$(newOne).children('.fa-times').click(function() {
		delete self.barlist[self.id];
		self.barlist.count--;
		$(newOne).remove();
	});
	$(newOne).children('.header').click(function() {
		if($(newOne).attr('small') != 'true') {
			$(newOne).children('.actions').slideUp(400);
			$(newOne).children('.body').slideUp(600, function() {
				$(newOne).width(150);
			});
			$(newOne).attr('small', 'true');
		} else {
			$(newOne).width(250);
			$(newOne).children('.actions').slideDown(400);
			$(newOne).children('.body').slideDown(600, function() {
				var wall = $(newOne).children('.body').children('div');
				var pwall = $(wall).parent();
				$(pwall).animate({ scrollTop: $(wall).height() }, 25);
			});
			$(newOne).attr('small', 'false');
		}
	});
	$(newOne).children('.actions').find('textarea').focus(function() {
		$(newOne).attr('panic', '');
	});
	if(self.barlist.count > 3) {
		delete self.barlist[$(holder).children().first().attr('fid')];
		self.barlist.count--;
		$(holder).children().first().remove();
	}

	socket.emit('message-get', [ this.id ]);
	socket.emit('alert-pop', this.id);
	$('[fid="'+ this.id +'"] > .alert-no')
		.html('0')
		.fadeOut(800);

	return newOne; // Retorna el nuevo elemento creado
}
chatWindow.prototype.pushMessage = function(msg) {
	var wall = $(this.domObj).children('.body').children('div');
	var pwall = $(wall).parent();
	$(wall).html($(wall).html() + '<div class="msg'+ ((msg.from.id == socket.lid) ? ' self' : '') +'"><div class="header">'+ msg.from.username +'</div><div class="body">'+ msg.msg +'</div></div>');
	$(pwall).animate({ scrollTop: $(wall).height() }, 25);
	return this.messages.push(msg); // Retorna el número de mensajes en la conversación
}
chatWindow.prototype.beginAlert = function() {
	var parent = $(this.domObj);
	var wind = $(this.domObj).children('.header');
	$(parent).attr('panic', 'true');
	function panic() {
		if($(parent).attr('panic') != 'true') {
			$(wind).removeClass('panic');
			return;	
		}
		if(!$(wind).hasClass('panic')) 
			$(wind).addClass('panic');
		else 
			$(wind).removeClass('panic');
		setTimeout(panic, 800);
	}
	panic();
}



/**
 * ChatFriends
*/
function chatFriends(_domObj, _holdBar) {
	var self = this;
	this.state = 'open';
	this.domObj = _domObj;
	this.holdBar = _holdBar;
	this.hider = $(this.domObj).children('.hider')[0];
	
	$(this.hider).click(function() {
		if(self.state === 'open')
			self.close();
		else
			self.open();
	});
}
chatFriends.prototype.open = function() {
	this.state = 'open';
	$(this.domObj).animate({
		width: '200px'
	}, 600);
	$($(this.domObj).find('.fa-chevron-left')[0]).attr('class', 'fa-chevron-right');
}
chatFriends.prototype.close = function() {
	this.state = 'close';
	$(this.domObj).animate({
		width: '0px'
	}, 1000);
	$($(this.domObj).find('.fa-chevron-right')[0]).attr('class', 'fa-chevron-left');
}
chatFriends.prototype.updateFriend = function(_friend) {
	var self = this;
	var friend = $(this.domObj).find('[fid="' + _friend.id + '"]')[0];
	if(friend != undefined) {
		$(friend).removeClass('online offline');
		$(friend).addClass(_friend.status);
		return;
	}
	var list = $(this.domObj).find('.list')[0];
	if(list != undefined) {
		var no = document.createElement('div');
		var alerts = document.createElement('div');

		$(no).addClass('chat-friend')
			.addClass(_friend.status)
			.attr('fid', _friend.id)
			.attr('name', _friend.name)
			.html(_friend.name)[0];

		if(_friend.status === 'online')
			$(list).prepend($(no));
		else
			$(list).append($(no));

		$(no).append($(alerts).addClass('alert-no').hide());
		$(no).click(function() {
			if(chatWindow.prototype.barlist[_friend.id] == undefined) {
				var newWindow = new chatWindow(_friend.id, _friend.name);
				newWindow.create(self.holdBar);
			}
		});
	} else
		console.log('* Error: No ha sido posible encontrar la lista de contactos');
}
chatFriends.prototype.pushAlert = function(list) {
	for(el in list) {
		if(list[el].cant != 0)
			$('[fid="'+ list[el].peer_id +'"] > .alert-no')
				.html(list[el].cant)
				.show();
	}
}



/**
 * Socket.io
*/
var cf = undefined;
var socket = undefined;
function zchat(_id, _username, _secret) {
	socket = io.connect('http://localhost:3100');
	socket.lid = _id;
	socket.username = _username;
	socket.secret = _secret;

	socket.on('connect', function() {
		console.log('Connecting socket.io');
		socket.emit('i-am', { id: socket.lid, username: socket.username, secret: socket.secret });
		cf = new chatFriends($('#chat-friends')[0], $('#chat-bar'));
	});
	socket.on('user-update', function(chunk) {
		console.log('user-update');
		console.log(chunk);
		if(chunk.id != socket.lid) {
			cf.updateFriend({ id: chunk.id, name: chunk.username, status: chunk.status });
		}
	});
	socket.on('message-from', function(msg) {
		var fid = msg.from.id;
		var to = socket.lid;

		console.log(msg);
		if(chatWindow.prototype.barlist[fid] != undefined) {
			chatWindow.prototype.barlist[fid].pushMessage(msg);
			chatWindow.prototype.barlist[fid].beginAlert();
		} else {
			$('.chat-friend[fid="'+ fid +'"]').click();
			setTimeout(function() {
				if(chatWindow.prototype.barlist[fid] != undefined)
					chatWindow.prototype.barlist[fid].beginAlert();
			}, 500);
		}
	});
	socket.on('conversation-flush', function(data) {
		console.log('conversation-flush');
		var wind = data.peer;
		if(chatWindow.prototype.barlist[wind] != undefined)
			for(var i = data.conv.length-1; i >= 0; i--) {
				chatWindow.prototype.barlist[wind].pushMessage({ 
					from: { 
						id: data.conv[i].user_id, 
						username: data.conv[i].username 
					}, 
					msg: data.conv[i].message 
				});
				console.log(data.conv[i]);
			}
	});
	socket.on('alerts-flush', function(data) {
		console.log('alerts-flush');
		console.log(data);
		chatFriends.prototype.pushAlert(data);
	});
}
