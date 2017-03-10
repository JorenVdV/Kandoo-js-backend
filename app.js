process.env.NODE_ENV = 'production';

var config = require('./_config');
var express = require('express'),
     https = require('https'),
    path = require('path'),
     fs = require('fs');

// var http = require('http');

var mongoose = require('mongoose');
var bodyParser = require('body-parser'); //body parser to acces request bodies.
var app = express();

mongoose.connect(config.mongoURI[app.settings.env], config.options, function (err) {
    if (err) {
        console.log('Error connecting to the database. ' + err);
    } else {
        console.log('Connected to database: ' + config.mongoURI[app.settings.env]);
    }
});

//CORS
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}));
// parse application/json
app.use(bodyParser.json());


const sslOptions = {
    key: fs.readFileSync('ssl/self-signed/server.key'),
    cert: fs.readFileSync('ssl/self-signed/server.crt')
};

// var server = https.createServer(sslOptions, app);
var server = http.createServer(app);

var port = process.env.PORT || 8000;

app.use(express.static(path.join(__dirname)));


server.listen(port, function () {
    console.log("App is running on port " + port);
});
var io = require('socket.io')(server);
io.configure(function () {
    io.set("transports", ["xhr-polling"]);
    io.set("polling duration", 10);
});
io.on('connection', function(client) {
    console.log('Client connected...');

    client.on('join', function(data) {
        console.log(data);
        client.emit('messages', 'Hello from server');
    });
});


// require("./routes")(app);
require("./routes/user-routes")(app,io);
require("./routes/session-routes")(app,io);
require("./routes/theme-routes")(app,io);
require("./routes/card-routes")(app,io);






//make a user/theme/session on the production server
require('./init-example');


module.exports = app;
