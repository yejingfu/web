var net = require('net');
var crypto = require('crypto');

var readHandshake = function (socket, buf) {
    var found = false, i, data, ret;

    // Search for '\r\n\r\n'
    for (i = 0; i < buf.length - 3; i++) {
	if (buf[i] === 13 && buf[i + 2] === 13 &&
	    buf[i + 1] === 10 && buf[i + 3] === 10) {
	    found = true;
	    break;
	}
    }
    if (!found) {
	return false;
    }
    data = buf.slice(0, i + 4).toString().split('\r\n');
    ret = answerHandshake(socket, data);
    console.log('answerHandsshake:'+ret);
    if (ret) {
	return true;
    } else {
	socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
	return false;
    }
};

var readHeaders = function (lines) {
    var i, match, headers = {};
    // Extract all headers
    // Ignore bad-formed lines and ignore the first line (HTTP header)
    for (i = 1; i < lines.length; i++) {
	if ((match = lines[i].match(/^([a-z-]+): (.+)$/i))) {
	    headers[match[1].toLowerCase()] = match[2]
	}
    }
    return headers;
};

var answerHandshake = function (socket, lines) {
    var path, key, sha1, headers;
    // First line
    if (lines.length < 6) {
	return false;
    }
    path = lines[0].match(/^GET (.+) HTTP\/\d\.\d$/i)
    if (!path) {
	return false;
    }
    path = path[1];
    // Extract all headers
    headers = readHeaders(lines);
    // Validate necessary headers
    if (!('host' in headers) || !('sec-websocket-key' in headers)) {
	return false;
    }
    if (headers.upgrade.toLowerCase() !== 'websocket' ||
	headers.connection.toLowerCase().split(', ').indexOf('upgrade') === -1) {
	return false;
    }
    if (headers['sec-websocket-version'] !== '13') {
	return false;
    }
    key = headers['sec-websocket-key']
    // Build and send the response
    sha1 = crypto.createHash('sha1')
    sha1.end(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11')
    key = sha1.read().toString('base64')
    socket.write('HTTP/1.1 101 Switching Protocols\r\n' +
'Upgrade: websocket\r\n' +
'Connection: Upgrade\r\n' +
		      'Sec-WebSocket-Accept: ' + key + '\r\n\r\n')
    return true;
};

var connected = false;

net.createServer(function(socket){
    socket.on('data', function(data) {
	if (!connected) {
  	  console.log('data:'+data.toString());
          connected =  readHandshake(socket, data);
	  socket.emit('connect');
	} else {
	    console.log('received from client:'+data.toString());
	    socket.write('Hello world');
	}

    });
    socket.on('end', function(){
	console.log('socket end');
    });
    socket.on('close', function(){
	console.log('socket close');
    });
    socket.on('error', function(e) {
	console.log('socket error:'+e);
    });

}).listen(1333);

console.log('Socket server is listening on port 1333');

