/**
 * Created by steve on 2/10/2017.
 */



module.exports = function (app, io) {

    const userController = require('../controllers/user-controller');



    // userController.setIO(io);

    app.post('/register', function (req, res) {
        userController.createUser(req, res);
    });
    app.get('/users', function (req, res) {
        userController.getUsers(req, res);
    });

    app.post('/login', function (req, res) {
        userController.login(req, res);

    });

    app.put('/user/:userId/update', function (req, res) {
        userController.updateUser(req, res);
    });

    app.delete('/user/:userId/delete', function (req, res) {
        userController.deleteUser(req, res);
    });
};