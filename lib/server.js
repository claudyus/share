var debug = require('debug')('share'),
    bearerToken = require('express-bearer-token'),
    exphbs = require('express-handlebars'),
    express = require('express'),
    formidable = require('formidable');
    fs = require('fs-extra'),
    logger = require('morgan'),
    path = require('path'),
    randomDir = require('./random'),
    Raven = require('raven'),
    rmdir = require('rimraf')

var config = {
  port: process.env.PORT || 5000,
  tmpDir: process.env.TMP_DIR || path.join(__dirname, '..', 'tmp'),
  uploadDir: process.env.UPLOAD_DIR || path.join(__dirname, '..', 'upload'),
  uploadDirOptions: {
    dotfiles: 'deny'
  }
};

if (process.env.SENTRY_DSN) {
  Raven.config(process.env.SENTRY_DSN).install();
}

if (!fs.existsSync(config.tmpDir))
  fs.mkdirSync(config.tmpDir);

if (!fs.existsSync(config.uploadDir))
  fs.mkdirSync(config.uploadDir);

var app = express();
app.disable('x-powered-by');
app.enable('trust proxy', ['loopback', 'linklocal', 'uniquelocal'])

app.engine('hbs', exphbs({defaultLayout: 'main.hbs'}));
app.set('view engine', 'hbs');

app.locals.brand = process.env.BRAND || 'File';

app.use(logger("combined"));
app.use(bearerToken());

app.get('/', function(req, res) {
  res.render('entry');
});

app.get('/u/', function(req, res) {
  if ('namespace' in req.query) {
      res.redirect('/u/' + req.query.namespace)
      res.end()
  } else {
    randomDir(config.uploadDir)
    .then(function (name) {
      res.redirect('/u/' + name)
      res.end()
    });
  }
});

app.get('/u/:random', function(req, res) {
  var dest_dir = path.join(config.uploadDir, req.params.random)
  if (!fs.existsSync(dest_dir))
    fs.mkdirSync(dest_dir);
  files = {}
  list_allowing = true
  // don't allow file list if .deny_list file exists
  if (fs.existsSync(path.join(dest_dir, '.deny_list'))) {
    list_allowing = false
  } else {
    files = fs.readdirSync(path.join(dest_dir))
  }
  res.render('home', {random: req.params.random, files: JSON.stringify(files), list_allowing: list_allowing});
});

app.get('/delete/:random', function(req, res) {
  var dest_dir = path.join(config.uploadDir, req.params.random)
  if (fs.existsSync(dest_dir)) {
    // don't allow deletion of bucket if .deny_delete file exists
    if (fs.existsSync(path.join(dest_dir, '.deny_delete'))) {
      res.sendStatus(405)
      return
    }
    rmdir(dest_dir, function() {
      res.redirect('/')
      res.end()
    });
  }
});

app.post('/u/:random', function(req, res) {
  var dest_dir = path.join(config.uploadDir, req.params.random)
  // if .token_upload exists we need to validate the req.token
  if (fs.existsSync(path.join(dest_dir, '.token_upload'))) {
    var token = fs.readFileSync(path.join(dest_dir, '.token_upload')).toString().trim()
    if (req.token != token) {
      res.sendStatus(401)
      return
    }
  }

  // create an incoming form object
  var form = new formidable.IncomingForm();

  // specify that we want to allow the user to upload multiple files in a single request
  form.multiples = true;

  // store all uploads in the /uploads directory
  form.tmpDir = config.tmpDir;

  // every time a file has been uploaded successfully,
  // move it to it's orignal name
  form.on('file', function(field, file) {
    try {
      fs.unlinkSync(path.join(dest_dir, file.name));  // unlink destination file if exist before move
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
    }
    fs.move(file.path, path.join(dest_dir, file.name), function(err) {
      if (err) {
        Raven.captureException(err);
        res.sendStatus(500)
      } else
          res.send(req.params.random + '/' + file.name )
    });
  });

  // log any errors that occur
  form.on('error', function(err) {
    Raven.captureException(err);
    console.log('An error has occured: \n' + err);
  });

  // parse the incoming request containing the form data
  form.parse(req);
});

app.use('/', express.static(config.uploadDir, config.uploadDirOptions));
app.use('/', express.static(path.join(__dirname, '..', 'public')));

app.use(function(req, res, next) {
  res.sendStatus(404);
  res.render('404');
});

app.listen(config.port);
debug('Listening on port %d', config.port);
