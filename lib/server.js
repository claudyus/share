var debug = require('debug')('share'),
  express = require('express'),
  exphbs = require('express-handlebars'),
  fs = require('fs'),
  path = require('path'),
  Q = require('q'),
  upload = require('./upload');

var config,
  app = express(),
  port = process.env.PORT || 3000;

config = {
  tmpDir: path.join(__dirname, '..', 'tmp'),
  uploadDir: path.join(__dirname, '..', 'uploads')
}

if (!fs.existsSync(config.tmpDir))
  fs.mkdirSync(config.tmpDir);

if (!fs.existsSync(config.uploadDir))
  fs.mkdirSync(config.uploadDir);

app.disable('x-powered-by');

app.engine('hbs', exphbs({defaultLayout: 'main.hbs'}));
app.set('view engine', 'hbs');

app.get('/', function(req, res) {
  res.render('home');
});

app.post('/upload', function(req, res) {
  upload(req, req.headers, config)
    .then(function(responses) {
      res.json(responses);
    })
    .fail(function(err) {
      debug(err);
      req.destroy();
    })
    .done();
});

app.use('/', express.static(config.uploadDir));
app.use('/', express.static(path.join(__dirname, '..', 'public')));

app.use(function(req, res, next) {
  res.status(404);
  res.render('404');
});

app.listen(port);
debug('Listening on port %d', port);
