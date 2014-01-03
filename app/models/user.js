
var mongoose = require('mongoose')
	, Schema = mongoose.Schema
	, _ = require('underscore')

var usuario_schema = new Schema({
	_id			: 	{ type: String, unique: true, index: true },
	username	: 	String,
	secret		: 	String,
	status		: 	String,
	openTabs	:  [String]
});

usuario_schema.statics = {

	addTab: function (userId, tabId, next) {
		this.findOne({ _id: userId }, function (err, user) {
			if(user != null) {
				user.openTabs.push(tabId)
				user.openTabs = _.uniq(user.openTabs)
				user.save()
			} else {
				console.log('* Warning: Ha ocurrido un error de sicronizción. Estoy buscando al usuario "'+ userId +'" y no lo encuentro.')
			}
			if(next)
				next()
		})
	}

	, rmvTab: function (userId, tabId, next) {
		this.findOne({ _id: userId }, function (err, user) {
			if(user != null) {
				user.openTabs = _.without(user.openTabs, tabId)
				user.save()
			} else {
				console.log('* Warning: Ha ocurrido un error de sicronizción. Estoy buscando al usuario "'+ userId +'" y no lo encuentro.')
			}
			if(next)
				next()
		})
	}

};

mongoose.model('user', usuario_schema);
