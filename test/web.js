var request = require('supertest');
var should = require('should');
var fs = require('fs');

var app = require('../lib/server.js');

var token = 'token_super_secret'

describe('Website tests', function() {
  it('GET / should return 200 OK', function(done) {
    request(app)
      .get('/')
      .expect(function(res) {
        res.body.should.match(/File Share/)     // ui: check brand
      })
      .expect(200, done);
  });

  it('GET /u/ should redirect with 302', function(done) {
    request(app)
      .get('/u/', {followRedirect: false})
      .expect(function(res) {
        res.header.location.should.match(/u\/.*/)     // redirect path match random format
      })
      .expect(302, done);
  });

  it('GET /u/ should redirect to given path', function(done) {
    request(app)
      .get('/u/?namespace=test', {followRedirect: false})
      .expect(function(res) {
        res.header.location.should.endWith('test')      // redirect path should end in test
      })
      .expect(302, done)
  });

  it('GET /u/random_test_dir should redirect to given path', function(done) {
    request(app)
      .get('/u/random_test_dir')
      .expect(function(res) {
        res.body.should.match(/random_test_dir/)
        res.body.should.match(/form.*dropzone/)     // ui: check dropbox form
        res.body.should.match(/a.*delete/)          // ui: chech lint to delete
      })
      .expect(200, done)
  });

  it('POST file to /u/random_test_dir', function(done){
    fs.unlink("./upload/random_test_dir/web.js", function(){})
    request(app)
      .post('/u/random_test_dir')
      .attach('filename', 'test/web.js')
      .expect(function(res) {
        res.body.should.match(/web.js/)     // the file should be listed in html
        // the file should exist in directory
        fs.existsSync("./upload/random_test_dir/web.js")
      })
      .expect(200, done)
  })

  it('test access token - return 401 without token', function(done){
    fs.writeFileSync("./upload/random_test_dir/.token_upload", token)
    request(app)
      .post('/u/random_test_dir')
      .attach('filename', 'test/web.js')
      .expect(function(res) {
        res.body.should.match(/random_test_dir/)
      })
      .expect(401, done)
  })

  it('test access token - return 200 with token', function(done){
    fs.writeFileSync("./upload/random_test_dir/.token_upload", token)
    request(app)
      .post('/u/random_test_dir?access_token=' + token)
      .attach('filename', 'test/web.js')
      .expect(function(res) {
        res.body.should.match(/random_test_dir/)
      })
      .expect(200, done)
  })

  it('test deny list - don\'t show file list', function(done){
    fs.writeFileSync("./upload/random_test_dir/.deny_list", 'random_string_not_used')
    request(app)
      .get('/u/random_test_dir?access_token=' + token)
      .expect(function(res) {
        res.body.should.match(/File listing not allowed for this bucket/)        //ui: check message in html
      })
      .expect(200, done)
  })

  it('test deny delete - GET /delete/random_test_dir should return 405', function(done) {
    fs.writeFileSync("./upload/random_test_dir/.deny_delete", 'random_string_not_used')
    request(app)
      .get('/delete/random_test_dir')
      .expect(405, done)
  });

  it('GET /delete/random_test_dir should remove directory', function(done) {
    fs.unlinkSync("./upload/random_test_dir/.deny_delete")
    request(app)
      .get('/delete/random_test_dir')
      .expect(function(res) {
        res.body.should.match(/random_test_dir/)
        res.header.location.should.be.exactly('/')

      })
      .expect(302, done)
  });

  it('GET /missed_url should return 404', function(done) {
    request(app)
      .get('/missed_url')
      .expect(function(res) {
        res.body.should.match(/youtube/)
      })
      .expect(404, done)
  });

    it('trigger cleanup GET /admin/cleanup', function(done) {
    fs.mkdirSync('upload/empty_dir');
    fs.writeFileSync('upload/.keep_dir', '')            // ensure that upload dir isn't deleted (fix travis)
    request(app)
      .get('/admin/cleanup')
      .expect(200, function(){
        if (fs.readdirSync('upload/').indexOf('empty_dir') != -1)
            done( new Error('Dir not deleted'))
        else
            done()
      })
  });

});


