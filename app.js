let express = require('express'),
    path = require('path');

var app = express();
require("./routes")(app);

let server = require('http').Server(app);

var port = process.env.PORT || 8000;

app.use(express.static(path.join(__dirname)));


server.listen(port, function () {
    console.log("App is running on port " + port);
});
