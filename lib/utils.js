var fs = require('fs'),
  path = require('path'),
  Q = require('q');

function randomName(length) {
  var i,
    name = '',
    alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (i = 0; i < length; i++) {
    name += alphabet[Math.floor(Math.random() * alphabet.length)];
  }

  return name;
}

function cleanupRecursively(folder, list) {
  // based on https://gist.github.com/jakub-g/5903dc7e4028133704a4
  var fs = require('fs');
  var path = require('path');

  var isDir = fs.statSync(folder).isDirectory();
  if (!isDir) {
    return;
  }
  var files = fs.readdirSync(folder);
  if (files.length > 0) {
    files.forEach(function(file) {
      var fullPath = path.join(folder, file);
      cleanupRecursively(fullPath, list);
    });

    // re-evaluate files; after deleting subfolder
    // we may have parent folder empty now
    files = fs.readdirSync(folder);
  }

  if (files.length === 0) {
    list.deleted.push(folder);
    fs.rmdirSync(folder);
    return;
  }
}

module.exports = {

  randomDir(parentDir) {
    var attempts = 0;

    function retry() {
      var name = randomName(12);
      attempts += 1;

      return Q.nfcall(fs.mkdir, path.join(parentDir, name))
        .thenResolve(name)
        .fail(onError);
    }

    function onError(err) {
      var message;

      if (attempts >= 3) {
        message = 'Failed to make random directory after ' + attempts +
          ' attempts: ' + err.message;

        throw new Error(message);
      }

      return retry();
    }

    return retry();
    },

  cleanupEmptyDirRecursively: cleanupRecursively
}
