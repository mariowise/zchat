


/**
 * ChatWindow
 * author: mariowise
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
chatWindow.prototype.create = function(holder) {
	var self = this;
	var newOne = document.createElement('div');
	this.domObj = newOne;
	$(newOne).attr('name', this.id);
	$(newOne).attr('class', 'chat-window');
	$(newOne).html('<i class="fa-times"></i><div class="header">'+ this.title +'</div><div class="body"></div><div class="actions"><textarea></textarea><button class="btn">Enviar</button></div>');
	$(holder).append(newOne);
	$($($(newOne).children('.actions')[0]).children('textarea')[0]).keypress(function(e) {
		if(e.keyCode == 13 && !e.shiftKey) {
			e.preventDefault();
			alert('Enviando mensaje');
		}
	});
	$(newOne).children('.fa-times').click(function() {
		delete self.barlist[self.title];
		self.barlist.count--;
		$(newOne).remove();
	});
	if(self.barlist.count > 3) {
		delete self.barlist[$(holder).children().first().attr('name')];
		self.barlist.count--;
		$(holder).children().first().remove();
	}

	return newOne; // Retorna el nuevo elemento creado
}
chatWindow.prototype.close = function() {

}
chatWindow.prototype.pushMessage = function(msg) {
	var wall = $(this.domObj).children('.body');
	$(wall).html($(wall).html() + '<div class="msg"><div class="header">'+ msg.header +'</div><div class="body">'+ msg.body +'</div></div>');
	$(wall).animate({ scrollTop: $(wall).height() }, 'slow');
	return this.messages.push(msg); // Retorna el número de mensajes en la conversación
}
chatWindow.prototype.sendAction = function(msg) {

}
chatWindow.prototype.getMessages = function(socket) {

}



/**
 * ChatFriends
 * author: mariowise
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
chatFriends.prototype.ider = {
	id: 0,
	get: function() {
		return ++this.id;
	}
}
chatFriends.prototype.updateFriend = function(_friend) {
	var self = this;
	var friend = $(this.domObj).find('[name="' + _friend.name + '"]')[0];
	if(friend != undefined) {
		$(friend).removeClass('online offline');
		$(friend).addClass(_friend.status);
		return;
	}
	var list = $(this.domObj).find('.list')[0];
	if(list != undefined) {
		var no = document.createElement('div');
		if(_friend.status === 'online')
			$(list).prepend($(no).addClass('chat-friend').addClass(_friend.status).attr('name', _friend.name).html(_friend.name)[0]);
		else
			$(list).append($(no).addClass('chat-friend').addClass(_friend.status).attr('name', _friend.name).html(_friend.name)[0]);
		$(no).click(function() {
			if(chatWindow.prototype.barlist[_friend.name] == undefined) {
				var newWindow = new chatWindow(self.ider.get(), _friend.name);
				newWindow.create(self.holdBar);
			}
		});
	} else
		console.log('* Error: No ha sido posible encontrar la lista de contactos');
}
chatFriends.prototype.openChatWindow = function() {

}
