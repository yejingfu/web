var http = require('http');

var count = 1;

http.createServer(function(req, res) {
  console.log('Process ' + process.threadId + ' Received request['+ (count++) + ']: ' + req.method  + ' ' + req.url);
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World : ' + process.threadId);
}).listen(3012, 'localhost');

console.log('Server is listening on port 3012, process: ' + process.threadId);


