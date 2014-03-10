
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var tutorials = require('./routes/tutorials');
var community = require('./routes/community');
var api = require('./routes/api');
var http = require('http');
var path = require('path');

var sharejs = require('share').server;

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

// RESTful APIs
var apiHandler = function(method, handler) {
    return function(req, res) {
        handler(req, res, method);
    };
};


app.get('/', httpHandler(routes.index));
app.get('/home', httpHandler(routes.home));
app.get('/tutorials', httpHandler(routes.tutorials));
app.get('/editor', httpHandler(routes.editor));
app.get('/community', httpHandler(routes.community));
app.get('/collaboration', httpHandler(routes.collaboration));
//app.get('/contacts', httpHandler(routes.contacts));

// tutorials
app.get('/tutorials/contents', apiHandler('GET', tutorials.list));
app.get('/tutorials/contents/:id', apiHandler('GET', tutorials.contentById));
app.post('/tutorials/contents/:id', apiHandler('POST', tutorials.contentById));

// community
app.get('/community/contents', apiHandler('GET', community.contents));
app.get('/community/contents/:id', apiHandler('GET', community.contentById));

// APIs
app.get('/asmapi/primitives', apiHandler('GET', api.primitives));
app.post('/asmapi/primitives', apiHandler('POST', api.primitives));
app.delete('/asmapi/primitives', apiHandler('DELETE', api.primitives));
app.put('/asmapi/primitives', apiHandler('PUT', api.primitives));
app.head('/asmapi/primitives', apiHandler('HEAD', api.primitives));

app.get('/asmapi/primitives/:id', apiHandler('GET', api.primitiveById));
app.post('/asmapi/primitives/:id', apiHandler('POST', api.primitiveById));

app.get('/asmapi/graphics/handle/:id', apiHandler('GET', api.graphicsFromHandleId));
app.delete('/asmapi/graphics/handle/:id', apiHandler('DELETE', api.graphicsFromHandleId));
app.put('/asmapi/graphics/boolean', apiHandler('PUT', api.graphicsFromBoolean));

//api.test();

sharejs.attach(app, {db:{type:'none'}});    // enable sharejs

http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});
