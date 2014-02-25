var parse = require('url').parse;

/**
 don't use exports, use module.exports instead if you want to export a single function
 The obj is list REST api like below:
    var obj = {
        GET:{
            '/':function(req, res) {...},
            '/account': function(req, res) {...}
        },
        POST:{
            '/things': function(req, res) {...},
            '/plugins': function(req, res) {...}
        }
     }
*/
module.exports = function(obj) {
    return function(req, res, next) {
        if (!obj[req.method]) {
            next();
            return;
        }
        var routes = obj[req.method];
        var url = parse(req.url);
        var paths = Object.keys(routes);
        for (var i = 0, len = paths.length; i < len; i++) {
            var p = paths[i];
            var fn = routes[p];
            p = p.replace(/\//g, '\\/').replace(/:(\w+)/g, '([^\\/]+)');
            console.log('path pattern:'+p);
            var re = new RegExp('^'+p+'$');
            var captures = url.pathname.match(re);
            //console.log(captures);
            if (captures) {
                var args = [req, res].concat(captures.slice(1));
                fn.apply(null, args);
                return;
            }
        }
        next();
    };
};