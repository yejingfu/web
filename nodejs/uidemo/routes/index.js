
/*
 * GET home page.
 */

exports.index = function(req, res) {
    res.redirect('/bracelet');
};

exports.home = function(req, res) {
    res.render('index', { title: 'Express' });
};

exports.bracelet = function(req, res) {
    res.render('bracelet', { title: 'Express' });
};