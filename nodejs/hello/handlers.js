// The request handlers

var fs = require('fs');
var formidable = require('formidable');

exports.start = function(response) {
  var body = '<html><head>'+
	'<meta http-equiv="Content-Type" ' +
	'content="text/html; charset=UTF-8" />' +
	'<title> upload image</title>' +
	'</head><body>' +
	'Please select a image file from disk:<br>' +
	'<form action="/upload" enctype="multipart/form-data" method="POST"> ' +
	'<input type="file" name="upload" multiple="multiple"> ' +
	'<input type="submit" value="upload"/>'+
	'</form></body></html>';
    
  response.writeHead(200, {'Context-Type': 'text/html'});
  response.write(body);
  response.end();
}

exports.upload = function(response, request) {
    var form = new formidable.IncomingForm();
    form.parse(request, function(error, fields, files){
      fs.rename(files.upload.path, '/tmp/testnode.png', function(err){
        if (err){
          fs.unlink('/tmp/testnode.png');
          fs.rename(files.upload.path, '/tmp/testnode.png');
	    }
	  });
      response.writeHead(200, {'Content-Type': 'text/html'});
      response.write('received image:<br/>');
      response.write('<img src="/show" />');
      response.end();
    });
}

exports.show = function(response) {
    fs.readFile('/tmp/testnode.png', 'binary', function(error, file){
	if(error){
	    response.writeHead(500, {"Content-Type": "text/plain"});
	    response.write(error + '\n');
	    response.end();
	}else{
	    response.writeHead(200, {'Content-Type': 'image/png'});
	    response.write(file, 'binary');
	    response.end();
	}
    });
}
