let express = require('express'),
    path = require('path');

var mongoose = require('mongoose');
var app = express();

require("./routes")(app);
mongoose.connect('mongodb://146.185.153.213/teamjs');

let server = require('http').Server(app);

var port = process.env.PORT || 8000;

app.use(express.static(path.join(__dirname)));


server.listen(port, function () {
    console.log("App is running on port " + port);
});
