/**
 * Created by steve on 2/13/2017.
 */
const sessionController = require('../controllers/session-controller');
// console.log('controller**********************');
// console.log(userController);
module.exports = function(app){
    app.post('/theme/:themeId/session', function(req,res){
        sessionController.createSession(req,res);
    });
    app.get('/session/:sessionId', function(req,res){
        sessionController.getSession(req,res);
    });

    app.post('/session/:sessionId/turn', function (req, res) {
        sessionController.playTurn(req,res);
    });
    // app.route('/register')
    //     .post(userController.createUser);
    // app.route('/users')
    //     .get(userController.getUsers);
    // app.route('/user/:userId')
    //     .get(userController.getUser)
    //     .delete(userController.deleteUser);
    app.get('/theme/:themeId/sessions', function(req,res){
        sessionController.getSessions(req,res);
    });
    app.delete('/session/:sessionId/delete', function(req,res){
        sessionController.deleteSession(req,res);
    })
};