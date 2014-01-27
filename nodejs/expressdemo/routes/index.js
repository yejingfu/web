
/*
 * GET home page.
 */

exports.index = function(req, res, ctx){
  res.redirect('/editor');
};

exports.home = function(req, res, ctx){
  res.render('index', ctx);
};

exports.tutorials = function(req, res, ctx){
    res.render('tutorials', ctx);
};

exports.editor = function(req, res, ctx) {
    res.render('editor', ctx);
};

exports.community = function(req, res, ctx) {
    res.render('community', ctx);
};

exports.contacts = function(req, res, ctx) {
    res.render('contacts', ctx);
};
