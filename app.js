let express = require('express'),
    path = require('path');

var app = express();

let server = require('http').Server(app);

var port = process.env.PORT || 8000;

app.use(express.static(path.join(__dirname)));

app.get('/', function (req, res, next) {
    res.send("This is a test to see if it compiles!")
});

server.listen(port, function () {
    console.log("App is running on port " + port);
});
