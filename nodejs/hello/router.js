// The router is responsible to dispatch request path to specific request handler

exports.route = function(path, handlers, response, request) {
    if (handlers.hasOwnProperty(path) && typeof handlers[path] === 'function') {
	handlers[path](response, request);
    } else {
	response.writeHead(404, {'Content-Type': 'text/plain'});
	response.write('404 Not found');
	response.end();
    }
}
