process.env.NODE_ENV = 'test';//'production';

var config = require('./_config');
var express = require('express'),
    // https = require('https'),
    path = require('path'),
    fs = require('fs');

var http = require('http');
let cors = require('cors');

var mongoose = require('mongoose');
var bodyParser = require('body-parser'); //body parser to access request bodies.
var app = express();

mongoose.connect(config.mongoURI[app.settings.env], function (err) {
    if (err) {
        console.log('Error connecting to the database. ' + err);
    } else {
        console.log('Connected to database: ' + config.mongoURI[app.settings.env]);
    }
});

//CORS
app.use(cors());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}));
// parse application/json
app.use(bodyParser.json());


// const sslOptions = {
//     key: fs.readFileSync('ssl/self-signed/server.key'),
//     cert: fs.readFileSync('ssl/self-signed/server.crt')
// };

// var server = https.createServer(sslOptions, app);
var server = http.createServer(app);

var port = process.env.PORT || 8000;

app.use(express.static(path.join(__dirname)));


server.listen(port, function () {
    console.log("App is running on port " + port);
});


var io = require('socket.io')(server);
io.on('connection', function (client) {
    console.log('Client connected...');

    client.on('loggedin', function (data) {

        var userService = require('./services/user-service');

        userService.getUserById(data).then(
            (user) => {
                console.log('The user: ' + user.firstname + ' connected!');
                user.websockets.push(client);
                userService.sendSocketMessage(user, 'messages', 'Socket registered on the server!');
            }
        ).catch();


        // client.emit('messages', 'Hello from server');
    });
});


require("./routes/user-routes")(app);
require("./routes/session-routes")(app);
require("./routes/theme-routes")(app);
require("./routes/card-routes")(app);


//make a user/theme/session on the production server
require('./init-example');


module.exports = app;
