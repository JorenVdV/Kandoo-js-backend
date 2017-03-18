/**
 * Created by Steven Gentens on 3/16/2017.
 */
const chatMessageController = require('../controllers/chat-message-controller');

module.exports = function(app){
    app.post('/session/:sessionId/message', function(req,res){
        chatMessageController.addMessage(req,res);
    });

    app.get('/session/:sessionId/messages/:messageLimit', function(req,res){
        chatMessageController.readMessagesBySessionId(req,res);
    });

    app.get('/session/:sessionId/messages', function(req,res){
        chatMessageController.readMessagesBySessionId(req,res);
    });
};