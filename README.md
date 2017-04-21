share
========

[![dependencies Status](https://david-dm.org/claudyus/share/status.svg)](https://david-dm.org/claudyus/share)

An internal web app for sharing files using
[dropzone.js](http://www.dropzonejs.com/). There are no limits on file size and
no user authentication. Files are never cleaned up.

You can upload a file called '.deny_list' to a given bucket to avoid to expose uploaded files.
Another operation that can be disable il bucket deletion, in this case you should upload a '.deny_delete' file.

## Configuration

The following enviroment variables can be used to change default behaviour of share:

 * PORT - define server listen port, default ```3000```
 * TMP_DIR - define the temp dir for upload, default ```tmp/```
 * UPLOAD_DIR - define the final upload dir, default ```upload/```
 * BRAND - define a custom brand, default ```File```

## Running

    $ npm install
    $ node .

## Updating client dependencies

    $ bower update
    $ grunt

# Dokku configuration

  $ git push deploy
  # dokku volume:add share /app/upload
  # dokku ps:restart share


# Nginx config

Remember to increase the max body size:

  client_max_body_size 2000M;
