/**
 * Created by nick on 06/02/17.
 */



module.exports = function (app) {
    app.get('/', function (req, res, next) {
        res.send("This is a test to see if it compiles!")
    });
    app.get('/session',function (req, res, next) {
        res.sendStatus(200);
    });

};