share
========

[![dependencies Status](https://david-dm.org/claudyus/share/status.svg)](https://david-dm.org/claudyus/share)
[![Build Status](https://travis-ci.org/claudyus/share.svg?branch=master)](https://travis-ci.org/claudyus/share)
[![Coverage Status](https://coveralls.io/repos/github/claudyus/share/badge.svg?branch=master)](https://coveralls.io/github/claudyus/share?branch=master)

An express.js web app for sharing files using [dropzone.js](http://www.dropzonejs.com/).
There are no limits on file size and by default no user authentication. Files are never cleaned up.

![screenshot](https://raw.githubusercontent.com/claudyus/share/master/images/screenshot.png)

Each file bucket is configurable using dot-files. You can upload a file called '.deny_list' to a given bucket to avoid to expose uploaded files.
Another operation that can be disable is the bucket deletion, in this case you should upload a '.deny_delete' file.
The '.token_upload' file can be used to set a bearer authorization token following [RFC6750](https://tools.ietf.org/html/rfc6750) standard.

## Configuration

The following enviroment variables can be used to change default behaviour of share:

 * PORT - define server listen port, default ```5000```
 * TMP_DIR - define the temp dir for upload, default ```tmp/```
 * UPLOAD_DIR - define the final upload dir, default ```upload/``` (when using Docker the default path is /app/upload)
 * BRAND - define a custom brand, default ```File```
 * SENTRY_DSN - if set, the exception are collected and sent to your sentry project

## Running

    $ npm install
    $ node .

## Updating client dependencies

    $ bower update
    $ grunt

# Dokku configuration

    $ git push deploy
    # dokku storage:mount share /var/lib/dokku/data/storage/share:/app/upload
    # dokku ps:restart share


# Nginx config

Remember to increase the max body size:

    client_max_body_size 2000M;
