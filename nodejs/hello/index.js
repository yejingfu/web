// This is first web applicaiton written in node.js

var server = require('./server');
var handlers = require('./handlers');
var router = require('./router');

var requestHandler = {
    '/': handlers.start,
    '/start': handlers.start,
    '/upload': handlers.upload,
    '/show': handlers.show
};

server.start(router.route, requestHandler);


