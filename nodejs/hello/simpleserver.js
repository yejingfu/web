// simple http server demo

http = require('http');

http.createServer(function(req, res){
  res.setHeader('Content-Type', 'text/json');
  var obj = {wwid: 11528435, name: 'Ye, Jingfu'};
  res.end(JSON.stringify(obj));
}).listen(3000);

