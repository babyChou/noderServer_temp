var fs = require('fs');

//ssl license


var options = {
  key:  fs.readFileSync('ssl/server.key'),
  cert: fs.readFileSync('ssl/server.crt')
};


//ssl object

var ssl = {};

ssl.options = options;

module.exports = ssl;