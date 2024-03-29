process.env.NODE_ENV = 'test';

var express = require('express'),
    path = require('path');

var mongoose = require('mongoose');
var bodyParser = require('body-parser'); //body parser to acces request bodies.
var app = express();

//CORS
app.use(function(req,res,next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}));
// parse application/json
app.use(bodyParser.json());


var server = require('http').createServer(app);

var port = process.env.PORT || 8000;

app.use(express.static(path.join(__dirname)));

server.listen(port, function () {
    console.log("App is running on port " + port);
});


require("./routes/user-routes")(app);
require("./routes/session-routes")(app);
require("./routes/theme-routes")(app);
require("./routes/card-routes")(app);




module.exports = app;
