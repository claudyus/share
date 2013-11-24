var fs = require('fs');
var path = require('path');
var express = require('express');
var exphbs = require('express3-handlebars');

var app = express();

var randomName = function (length) {
  var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  var name = '';
  for (var i = 0; i < length; i++) {
    var number = Math.floor(Math.random() * alphabet.length);
    name += alphabet[number];
  }

  return name;
};

var tmpDir = path.join(__dirname, 'tmp');
var uploadsDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(tmpDir))
  fs.mkdirSync(tmpDir);

if (!fs.existsSync(uploadsDir))
  fs.mkdirSync(uploadsDir);

app.disable('x-powered-by');

app.engine('hbs', exphbs({defaultLayout: 'main.hbs'}));
app.set('view engine', 'hbs');

app.use(express.limit('100 gb'));
app.use(express.bodyParser({uploadDir: tmpDir}));
app.use('/share', express.static(uploadsDir));
app.use('/share', express.static(path.join(__dirname, 'public')));

app.get('/share', function (req, res) {
  res.render('home');
});

app.post('/share/upload', function (req, res) {
  var folder = randomName(5);
  var name = req.files.file.name;

  fs.mkdirSync(path.join(uploadsDir, folder));
  fs.renameSync(req.files.file.path, path.join(uploadsDir, folder, name));

  res.send(folder + '/' + encodeURIComponent(name));
});

app.use(function (req, res, next) {
  res.status(404);
  res.render('404');
});

var port = process.env.PORT || 3000;
app.listen(port);
console.log('Listening on port ' + port);