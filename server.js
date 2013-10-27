var fs = require('fs');
var path = require('path');
var ejs = require('ejs');
var express = require('express');
var app = express();

var randomName = function(length) {
	var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

	var name = '';
	for (var i = 0; i < length; i++) {
		var number = Math.floor(Math.random() * alphabet.length);
		name += alphabet[number];
	}

	return name;
}

var tmpDir = path.join(__dirname, 'tmp');
var uploadsDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(tmpDir))
	fs.mkdirSync(tmpDir);

if (!fs.existsSync(uploadsDir))
	fs.mkdirSync(uploadsDir);

app.set('views', __dirname + '/views');
app.engine('html', ejs.renderFile);

app.use(express.limit('100 gb'));
app.use(express.bodyParser({uploadDir: tmpDir}));
app.use('/share', express.static(uploadsDir));
app.use('/share', express.static(path.join(__dirname, 'deps')));

app.get('/share', function (req, res)
{
	res.render('index.html');
});

app.post('/upload', function (req, res) {
	var folder = randomName(5);
	var name = req.files.file.name;

	fs.mkdirSync(path.join(uploadsDir, folder));
	fs.renameSync(req.files.file.path, path.join(uploadsDir, folder, name));

	res.send(folder + '/' + encodeURIComponent(name));
});

app.use(function (req, res, next) {
	res.status(404);
	res.render('404.html');
});

app.listen(80);