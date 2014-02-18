
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var api = require('./routes/api');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);

//app.use(express.static(path.join(__dirname, 'public')));  // use nginx for static server

// development only
if ('development' === app.get('env')) {
    console.log('debug is ON');
    app.use(express.errorHandler());
}

var ctx = {
    title: 'Jeff Ye'
};

var httpHandler = function(handler) {
    return function(req, res) {
        handler(req, res, ctx);
    };
};

app.get('/', httpHandler(routes.index));
app.get('/home', httpHandler(routes.home));
app.get('/tutorials', httpHandler(routes.tutorials));
app.get('/editor', httpHandler(routes.editor));
app.get('/community', httpHandler(routes.community));
app.get('/contacts', httpHandler(routes.contacts));

// RESTful APIs
var apiHandler = function(method, handler) {
    return function(req, res) {
        handler(req, res, method);
    };
};

app.get('/api/primitives', apiHandler('GET', api.primitives));
app.post('/api/primitives', apiHandler('POST', api.primitives));
app.delete('/api/primitives', apiHandler('DELETE', api.primitives));
app.put('/api/primitives', apiHandler('PUT', api.primitives));
app.head('/api/primitives', apiHandler('HEAD', api.primitives));

app.get('/api/primitives/:id', apiHandler('GET', api.primitiveById));
app.post('/api/primitives/:id', apiHandler('POST', api.primitiveById));

//api.test();

http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});
