
/**
 * ChatWindow
 * author: mariowise
*/
function chatWindow(_title, _socket) {
	this.title = _title;
	this.socket = _socket;
	this.room = undefined;
	this.messages = [];
	this.domObj = undefined;
}
chatWindow.prototype.create = function(holder) {
	var self = this;
	var newOne = document.createElement('div');
	this.domObj = newOne;
	$(newOne).attr('class', 'chat-window');
	$(newOne).html('<div class="header">'+ this.title +'</div><div class="body"></div><div class="actions"><textarea></textarea><button class="btn">Enviar</button></div>');
	$(holder).append(newOne);
	$($($(newOne).children('.actions')[0]).children('textarea')[0]).keypress(function(e) {
		if(e.keyCode == 13 && !e.shiftKey) {
			e.preventDefault();
			alert('Enviando mensaje');
		}
	});
	return newOne; // Retorna el nuevo elemento creado
}
chatWindow.prototype.pushMessage = function(msg) {
	var wall = $(this.domObj).children('.body');
	$(wall).html($(wall).html() + '<div class="msg"><div class="header">'+ msg.header +'</div><div class="body">'+ msg.body +'</div></div>');
	$(wall).animate({ scrollTop: $(wall).height() }, 'slow');
	return this.messages.push(msg); // Retorna el número de mensajes en la conversación
}
chatWindow.prototype.sendAction = function(msg) {

}



/**
 * ChatFriends
 * author: mariowise
*/
function chatFriends(_domObj) {
	var self = this;
	this.state = 'open';
	this.domObj = _domObj;
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

