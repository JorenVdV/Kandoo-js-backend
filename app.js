let express = require('express'),
    path = require('path');

var app = express();

let server = require('http').Server(app);

var port = process.env.PORT || 8000;

app.use(express.static(path.join(__dirname)));

app.get('/', function(req, res, next){
    res.sendStatus(200);
});

server.listen(port, function() {
    console.log("App is running on port " + port);
});
