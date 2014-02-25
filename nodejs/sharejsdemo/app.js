
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var sharejs = require('share').server;

var connect = require('connect');
var conrouter = require('./routes/connectrouter');

if (process.env.frame === 'express') {
    console.log('use express framework!');

    var app = express();
    app.set('port', process.env.PORT || 3001);
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'ejs');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(express.static(path.join(__dirname, 'node_modules', 'share')));
    //app.use(express.static(sharejs.scriptsDir));

    // development only
    if ('development' == app.get('env')) {
      app.use(express.errorHandler());
    }

    app.get('/', routes.index);

    // 1,
    var httpServer = http.createServer(app);
    sharejs.attach(app, {db:{type:'none'}});    // enable sharejs
    httpServer.listen(app.get('port'), function(){
      console.log('Express server listening on port ' + app.get('port'));
    });

    // 2,
    // sharejs.attach(app, {db:{type:'none'}});
    // app.listen(app.get('port'));
    // console.log('The Express server is listening on port ' + app.get('port'));

} else {
    console.log('use connect framework!');
    var app = connect();
    app.use(connect.favicon());
    app.use(connect.logger('dev'));
    app.use(connect.static(path.join(__dirname, 'public')));
    app.use(connect.static(path.join(__dirname, 'node_modules', 'share')));
    var http_routes = {
        GET:{
            '/':function(req, res) {
                routes.index(req, res);
            }
        }
    };
    app.use(conrouter(http_routes));

    // attach sharejs server
    sharejs.attach(app, {db:{type:'none'}});
    var port = process.env.PORT || 3001;
    app.listen(port);
    console.log('The connect server is running on port ' + port);

}


