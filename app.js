var app = require('./lib/server.js')

var port = process.env.PORT || 5000
console.log('Listening on port %d', port);
app.listen(port)

