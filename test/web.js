var request = require('supertest');
var should = require('should');

var app = require('../lib/server.js');

var token = 'token_super_secret'

describe('Website tests', function() {
  it('GET / should return 200 OK', function(done) {
    request(app)
      .get('/')
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
      })
      .expect(200, done)
  });

  it('POST file to /u/random_test_dir', function(done){
    request(app)
      .post('/u/random_test_dir')
      .attach('filename', 'test/web.js')
      .expect(function(res) {
        res.body.should.match(/web.js/)     // the file should be listed in html
      })
      .expect(200, done)
  })

  it('GET /delete/random_test_dir should remove directory', function(done) {
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

});


