var ejs = require('ejs');
var path = require('path');

var viewDir = path.join(__dirname, '..', 'views');
/*
 * GET home page.
 */

exports.index = function(req, res){
  ejs.renderFile(path.join(viewDir, 'index.ejs'), { title: 'Collaboration' }, function(err, str){
    if (err) {
        console.log('error:'+err);
        throw err;
    }
    res.end(str);
  });
};