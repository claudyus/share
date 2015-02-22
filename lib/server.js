var debug = require('debug')('share'),
  express = require('express'),
  exphbs = require('express-handlebars'),
  logger = require('morgan'),
  fs = require('fs'),
  path = require('path'),
  Q = require('q'),
  randomDir = require('./random'),
  upload = require('./upload');

var config, app = express();

config = {
  port: process.env.PORT || 3000,
  tmpDir: process.env.TMP_DIR || path.join(__dirname, '..', 'tmp'),
  uploadDir: process.env.UPLOAD_DIR || path.join(__dirname, '..', 'upload')
};

if (!fs.existsSync(config.tmpDir))
  fs.mkdirSync(config.tmpDir);

if (!fs.existsSync(config.uploadDir))
  fs.mkdirSync(config.uploadDir);

app.disable('x-powered-by');

app.engine('hbs', exphbs({defaultLayout: 'main.hbs'}));
app.set('view engine', 'hbs');

app.locals.brand = process.env.BRAND || 'File';
app.locals.homejs = fs.readFileSync(
  path.join(__dirname, '..', 'assets/home.js'));

app.use(logger());

app.get('/', function(req, res) {
  randomDir(config.uploadDir)
  .then(function (name) {
    res.redirect('/u/' + name)
    res.end()
  });
});

app.get('/u/:random', function(req, res) {
  res.render('home', {random: req.params.random} );
});

app.post('/u/:random', function(req, res) {
  upload(req, req.headers, config, req.params.random)
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

app.listen(config.port);
debug('Listening on port %d', config.port);
