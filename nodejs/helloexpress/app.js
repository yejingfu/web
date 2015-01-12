var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

app.get('/test/', function(req, res) {  // BAD path: '/test/:name'
  res.end('Test---');
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found: AA');
    err.status = 404;
    next(err);
});

// development error handler will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

// socket server setup
var socketserver = require('http').Server(app);
var io = require('socket.io')(socketserver);
var fs = require('fs');
io.on('connection', function(socket){
  console.log('get a connection from client');
  socket.on('chat message', function(msg) {
    io.emit('chat message', msg);
  });
});

socketserver.listen(3001, function(){
  console.log('socket server is listening on port 3001');
});



console.log('env: ' + app.get('env'));      // set in command line like: $ NODE_ENV=production ./bin/www
console.log('DEBUG: ' + process.env.DEBUG); // set in command line like: $ DEBUG=XXX ./bin/www

module.exports = app;
