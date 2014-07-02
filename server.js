var Busboy = require('busboy'),
  debug = require('debug')('share'),
  express = require('express'),
  exphbs = require('express3-handlebars'),
  fs = require('fs'),
  path = require('path'),
  Q = require('q'),
  sanitize = require('sanitize-filename');

var tmpDir = path.join(__dirname, 'tmp'),
  uploadsDir = path.join(__dirname, 'uploads'),
  app = express(),
  port = process.env.PORT || 3000; 

function randomName(length) {
  var i,
    name = '',
    alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (i = 0; i < length; i++) {
    name += alphabet[Math.floor(Math.random() * alphabet.length)];
  }

  return name;
}

if (!fs.existsSync(tmpDir))
  fs.mkdirSync(tmpDir);

if (!fs.existsSync(uploadsDir))
  fs.mkdirSync(uploadsDir);

app.disable('x-powered-by');

app.engine('hbs', exphbs({defaultLayout: 'main.hbs'}));
app.set('view engine', 'hbs');

app.use('/share', express.static(uploadsDir));
app.use('/share', express.static(path.join(__dirname, 'public')));

app.get('/share', function(req, res) {
  res.render('home');
});

app.post('/share/upload', function(req, res) {
  var folder = randomName(5),
    name = '',
    busboy = new Busboy({headers: req.headers});

  busboy.on('file', function(fieldname, file, filename) {
    name = sanitize(filename);
    file.pipe(fs.createWriteStream(path.join(tmpDir, folder)));
  });

  busboy.on('finish', function() {
    Q.nfcall(fs.mkdir, path.join(uploadsDir, folder))
      .then(function() {
        return Q.nfcall(fs.rename,
          path.join(tmpDir, folder),
          path.join(uploadsDir, folder, name));
      })
      .then(function() {
        res.send(folder + '/' + encodeURIComponent(name));
      })
      .done();
  });

  req.pipe(busboy);
});

app.use(function(req, res, next) {
  res.status(404);
  res.render('404');
});

app.listen(port);
debug('Listening on port %d', port);
