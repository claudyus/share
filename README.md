share
=====

An internal web app for sharing files using
[dropzone.js](http://www.dropzonejs.com/). There are no limits on file size and
no user authentication. Files are never cleaned up.

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
