/**
 * Created by steve on 2/10/2017.
 */

const userController = require('../controllers/user-controller');
// console.log('controller**********************');
// console.log(userController);
module.exports = function(app){
    app.post('/register', function(req,res){
        userController.createUser(req,res);
    });
    app.get('/users', function(req,res){
        userController.getUsers(req,res);
    });
    // app.route('/register')
    //     .post(userController.createUser);
    // app.route('/users')
    //     .get(userController.getUsers);
    // app.route('/user/:userId')
    //     .get(userController.getUser)
    //     .delete(userController.deleteUser);
};