var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.get('/chat', function(req, res) {
  res.sendfile('public/chat.html');
});

module.exports = router;
