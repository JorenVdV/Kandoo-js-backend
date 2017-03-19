/**
 * Created by steve on 2/10/2017.
 */
const auth = require('../controllers/authentication-controller');
const userController = require('../controllers/user-controller');


module.exports = function (app) {

    app.post('/register', function (req, res) {
        userController.createUser(req, res);
    });
    app.get('/users', function (req, res) {
        userController.getUsers(req, res);
    });

    app.post('/login', function (req, res) {
        userController.login(req, res);
    });

    app.get('/user/:userId', auth.userAccess, function (req, res) {
        userController.getUser(req, res);
    });

    app.put('/user/:userId/update', auth.userAccess, function (req, res) {
        userController.updateUser(req, res);
    });

    app.delete('/user/:userId/delete', auth.userAccess, function (req, res) {
        userController.deleteUser(req, res);
    });
};