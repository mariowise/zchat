
/**
 * Module dependencies.
 */

var express = require('express'),
 	http = require('http'),
	path = require('path'),
	fs = require('fs'),
	config = require('./config/config')['development'],
	mongoStore = require('connect-mongo')(express),
	flash = require('connect-flash'),
	nunjucks = require('nunjucks'),
	nun_env = undefined

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);

// Nunjucks template engine
nun_env = new nunjucks.Environment(new nunjucks.FileSystemLoader(config.root + '/app/views'));
nun_env.express(app);

app.use(express.favicon());
app.use(express.logger('dev'));

// cookieParser should be above session
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.methodOverride());

// Use less middleware
app.use(require('less-middleware')({ src: config.root + '/public' }));
app.use(express.static(path.join(config.root, 'public')));

//express/mongo session storage
app.use(express.session({
    secret: 'boilerplatejs',
    store: new mongoStore({
        url: config.db,
        collection : 'sessions'
    })
}));

// connect flash for flash messages
app.use(flash());

// // use passport session
// app.use(passport.initialize());
// app.use(passport.session());

// adds CSRF support
app.use(express.csrf());

// View-Helpers
// app.use(require('./middlewares/view-helpers'))

app.use(app.router);

app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// Routes
require('./config/routes')(app, undefined);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
