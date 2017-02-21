process.env.NODE_ENV = 'production';

var config = require('./_config');
var express = require('express'),
    path = require('path');

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

var server = require('http').Server(app);

var port = process.env.PORT || 8000;

app.use(express.static(path.join(__dirname)));


require("./routes")(app);
require("./routes/user-routes")(app);
require("./routes/session-routes")(app);
require("./routes/theme-routes")(app);

server.listen(port, function () {
    console.log("App is running on port " + port);
});

//make a user/theme/session on the production server
require('./init-example');


module.exports = app;
