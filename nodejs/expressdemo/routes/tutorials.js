var path = require('path');
var fs = require('fs');
var markdown = require('markdown-js');
var contentDir = path.join(__dirname, '..', 'views', 'tutorials');
var contentName2Path = {};  //contentName: full path

exports.list = function(req, res, method) {
    console.log('/tutorials[' + method + ']');
    if (method === 'GET') {
        fs.readdir(contentDir, function(err, files) {
            if (err) throw err;
            var result = {};
            result.names = [];
            for (var i = 0, len = files.length; i < len; i++) {
                var fullpath = path.join(contentDir, files[i]);
                var file = files[i];
                file = file.toLowerCase();
                if (file.slice(file.length - 3) === '.md') {
                    file = file.slice(0, file.length - 3);
                    result.names.push(file);
                    contentName2Path[file] = fullpath;
                }
            }
            res.end(JSON.stringify(result));
        });
    } else {
        res.end();
    }
};

exports.contentById = function(req, res, method) {
    console.log('/tutorials[' + method + ']: ' + req.params.id);
    if (method === 'GET') {
        var file = contentName2Path[req.params.id];
        if (file) {
            fs.readFile(file, function(err, data) {
                if (err) throw err;
                if (req.query.type === 'html') {
                    res.end(markdown.makeHtml(data.toString()));
                } else {
                    res.end(data);
                }
            });
        } else {
            res.statusCode = 404;
            res.end();
        }
    } else if (method === 'POST') {
        var data = req.body.content;
        var username = req.body.username;
        if (username !== 'JeffYe') {
            res.statusCode = 403;
            res.end();
            return;
        }

        if (data) {
            var file = contentName2Path[req.params.id];
            if (file) {
                fs.writeFile(file, data, function(err) {
                    if (err) throw err;
                    res.end();
                    return;
                });
            }
        }
        res.end();
    } else {
        res.statusCode = 404;
        res.end();
    }
}