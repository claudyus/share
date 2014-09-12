var Busboy = require('busboy'),
  debug = require('debug')('share'),
  fs = require('fs'),
  path = require('path'),
  Q = require('q'),
  randomDir = require('./random'),
  rimraf = require('rimraf'),
  sanitize = require('sanitize-filename');

function Upload(name, file, config) {
  if (!(this instanceof Upload)) {
    return new Upload(name, file, config);
  }

  this.name = sanitize(name);
  this.file = file;
  this.config = config;
  this.random = null;
  this.writeStream = null;
  this.aborted = false;
}

Upload.prototype.start = function() {
  var self = this;

  return randomDir(self.config.uploadDir)
    .then(function(random) {
      self.random = random;
    })
    .then(function() {
      return self.pipeToTmpFile();
    })
    .then(function() {
      return self.moveToUploadDir();
    });
}

Upload.prototype.pipeToTmpFile = function() {
  var self = this,
    deferred = Q.defer(),
    tmpFile = path.join(self.config.tmpDir, self.random);

  self.writeStream = fs.createWriteStream(tmpFile);

  function onError(err) {
    self.file.unpipe();
    self.writeStream.destroy();
    deferred.reject(err);
  }

  function onFinish() {
    deferred.resolve();
  }

  self.file.on('error', onError);
  self.writeStream.on('error', onError);
  self.writeStream.on('finish', onFinish);

  self.file.pipe(self.writeStream);

  return deferred.promise;
}

Upload.prototype.moveToUploadDir = function() {
  return Q.nfcall(fs.rename,
                  path.join(this.config.tmpDir, this.random),
                  path.join(this.config.uploadDir, this.random, this.name));
}

Upload.prototype.abort = function() {
  if (this.aborted)
    return;

  this.aborted = true;
  debug('Aborting upload %s', this.name);

  this.file.unpipe();

  if (this.writeStream) {
    this.writeStream.destroy();
  }

  if (this.random) {
    rimraf(path.join(this.config.tmpDir, this.random), logAnyError);
    rimraf(path.join(this.config.uploadDir, this.random), logAnyError);
  }

  function logAnyError(err) {
    if (err) {
      debug(err);
    }
  }
}

Upload.prototype.url = function() {
  return encodeURIComponent(this.random) + '/' + encodeURIComponent(this.name);
}

function upload(stream, headers, config) {
  var busboy = new Busboy({headers: headers}),
    deferred = Q.defer(),
    uploads = [],
    promises = [];

  function onFile(field, file, name) {
    var upload = Upload(name, file, config);
    uploads.push(upload);
    promises.push(upload.start().fail(onError));
  }

  function onBusboyFinish() {
    Q.all(promises).then(onUploadFinish).done();
  }

  function onUploadFinish() {
    var urls = uploads.map(function(upload) {
      return upload.url();
    });

    deferred.resolve(urls);
  }

  function onError(err) {
    debug('Upload error: %s', err);

    stream.unpipe();

    uploads.forEach(function(upload) {
      upload.abort();
    });

    deferred.reject(err);
  }

  stream.on('error', onError);
  busboy.on('error', onError);

  busboy.on('file', onFile);
  busboy.on('finish', onBusboyFinish);

  stream.pipe(busboy);

  return deferred.promise;
}

module.exports = upload;
