var debug = require('debug')('share'),
    bearerToken = require('express-bearer-token'),
    exphbs = require('express-handlebars'),
    express = require('express'),
    formidable = require('formidable'),
    fs = require('fs-extra'),
    logger = require('morgan'),
    path = require('path'),
    utils = require('./utils'),
    Raven = require('raven'),
    rmdir = require('rimraf');

var app = express();

var config = {
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
      res.redirect('/u/' + req.query.namespace);
      res.end();
  } else {
    utils.randomDir(config.uploadDir)
    .then(function (name) {
      res.redirect('/u/' + name);
      res.end();
    });
  }
});

app.get('/u/:random', function(req, res) {
  var dest_dir = path.join(config.uploadDir, req.params.random)
  if (!fs.existsSync(dest_dir))
    fs.mkdirSync(dest_dir);
  var files = {};
  var list_allowing = true;
  // don't allow file list if .deny_list file exists
  if (fs.existsSync(path.join(dest_dir, '.deny_list'))) {
    list_allowing = false;
  } else {
    files = fs.readdirSync(path.join(dest_dir));
  }
  res.render('home', {random: req.params.random, files: JSON.stringify(files),
    list_allowing: list_allowing, token: req.token});
});

app.get('/u/:random/:filename', function(req, res) {
  // redirect request on filename to static file serve
  res.redirect('/' + req.params.random + '/' + req.params.filename);
  res.end();
});

app.get('/delete/:random', function(req, res) {
  var dest_dir = path.join(config.uploadDir, req.params.random);
  if (fs.existsSync(dest_dir)) {
    // don't allow deletion of bucket if .deny_delete file exists
    if (fs.existsSync(path.join(dest_dir, '.deny_delete'))) {
      return res.sendStatus(405);
    }
    rmdir(dest_dir, function() {
      res.redirect('/');
      return res.end()
    });
  }
});

app.post('/u/:random', function(req, res) {
  var dest_dir = path.join(config.uploadDir, req.params.random)
  // if .token_upload exists we need to validate the req.token
  if (fs.existsSync(path.join(dest_dir, '.token_upload'))) {
    var token = fs.readFileSync(path.join(dest_dir, '.token_upload')).toString().trim();
    if (req.token != token) {
      return res.sendStatus(401);
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
        return res.sendStatus(500);
      } else
        return res.send(req.params.random + '/' + file.name );
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


app.get('/api/bucket/:bucket_name/files', function(req, res) {
  var dest_dir = path.join(config.uploadDir, req.params.bucket_name)
  if (!fs.existsSync(dest_dir))
    fs.mkdirSync(dest_dir);
  var files = {};
  var list_allowing = true;
  // don't allow file list if .deny_list file exists
  if (fs.existsSync(path.join(dest_dir, '.deny_list'))) {
    list_allowing = false;
  } else {
    files = fs.readdirSync(path.join(dest_dir));
  }
  res.send(files)
});

app.delete('/api/bucket/:bucket_name/:file', function(req, res) {
  var dest_dir = path.join(config.uploadDir, req.params.bucket_name);
  if (fs.existsSync(dest_dir)) {
    // don't allow deletion of bucket if .deny_delete file exists
    if (fs.existsSync(path.join(dest_dir, '.deny_delete'))) {
      return res.sendStatus(405);
    }
    console.log(req.params)
    rmdir(path.join(dest_dir, req.params.file), function() {
      res.redirect('/');
      return res.end()
    });
  }
});

app.get('/admin/cleanup', function(req, res) {
    var list = {deleted: []};
    utils.cleanupEmptyDirRecursively(config.uploadDir, list);
    res.send(JSON.stringify(list));
    return res.end();
});

app.use('/', express.static(config.uploadDir, config.uploadDirOptions));
app.use('/', express.static(path.join(__dirname, '..', 'public')));

app.use(function(req, res, next) {
  res.status(404).render('404');
});

module.exports = app
