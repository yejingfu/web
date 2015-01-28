// simple http server demo

http = require('http');

http.createServer(function(res, res){
  res.end('Hello World');
}).listen(3000);

