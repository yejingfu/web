// The server to listen the request from client on port 8888

var http = require("http");
var url = require('url');

var counter = 0;

function start(route, handlers) {
    function onRequest(req, res){
        console.log('onRequest: ' + (counter++));

	var path = url.parse(req.url).pathname;
	route(path, handlers, res, req);
    }

    http.createServer(onRequest).listen(8888);
    console.log('Server is started!');
}

exports.start = start;
