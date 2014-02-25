var https = require('https');
var markdown = require('markdown-js');

var excluded = [];
var isExcluded = function(el) {
    for (var i = 0, len = excluded.length; i < len; i++) {
        if (el === excluded[i]) {
            return true;
        }
    }
    return false;
};

var base64_encode = function(str) {
    var buf = new Buffer(str);
    return buf.toString('base64');
};

var base64_decode = function(str) {
    var buf = new Buffer(str, 'base64');
    return buf.toString();
};

var blogPath = '/repos/yejingfu/blog/contents/2014';
var blogNameToGitURL = {};

var sendRequestToGithub = function(reqPath, cb) {
        // get content list from github
    var options = {
        hostname: 'api.github.com',
        port: 443,
        path: reqPath,
        method: 'GET',
        headers:{'User-Agent':'yejingfu'}
    };
    var data = '';
    var req = https.request(options, function(res) {
        console.log('github:'+res.statusCode);
        res.on('data', function(chunk) {
            //console.log('data:'+chunk);
            data += chunk;
        }).on('end', function() {
            //console.log('finished:'+data);
            cb(undefined, data);
        }).on('error', function(err) {
            console.log('error:'+err.message);
            cb(err, data);
        })
    });
    req.on('error', function(err) {
        console.log('req error:'+err.message);
        cb(err, data);
    });
    req.end();  // sending out request
};

exports.contents = function(req, res, method) {
    console.log('/community/contents['+method+']');
    if (method !== 'GET') {
        res.statusCode = 404;
        res.end();
        return;
    }
    blogNameToGitURL = {};
    var names = Object.keys(blogNameToGitURL);
    if (names.length === 0) {
        sendRequestToGithub(blogPath, function(err, data) {
            if (err) throw err;
            var list = JSON.parse(data);
            for (var i = 0, len = list.length; i < len; i++) {
                var name = list[i].name;
                if (name.slice(name.length - 3) === '.md') {
                    name = name.slice(0, name.length - 3);
                    if (!isExcluded(name)) {
                        names.push(name);
                        blogNameToGitURL[name] = list[i].git_url;
                    }
                }
            }
            res.end(JSON.stringify(names));
        });
    } else {
        res.end(JSON.stringify(names));
    }

};

exports.contentById = function(req, res, method) {
    console.log('/community/contents/'+req.params.id+'['+method+']');
    var gitURL = blogNameToGitURL[req.params.id];
    if (gitURL) {
        sendRequestToGithub(gitURL, function(err, data) {
            if (err) throw err;
            // decode the base64 string and convert to HTML
            var rawStr = base64_decode(JSON.parse(data).content);
            res.end(markdown.makeHtml(rawStr));
        });
    }
};