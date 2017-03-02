/**
 * Created by steve on 2/10/2017.
 */

const userController = require('../controllers/user-controller');

module.exports = function(app){
    app.post('/register', function(req,res){
        userController.createUser(req,res);
    });
    app.get('/users', function(req,res){
        console.log(req.originalUrl);
        userController.getUsers(req,res);
    });

    app.post('/login', function(req,res){
       userController.login(req,res);
    });

    app.put('/user/:userId/update', function(req,res){
        userController.updateUser(req,res);
    });

    app.delete('/user/:userId/delete', function(req,res){
       userController.deleteUser(req,res);
    });
};