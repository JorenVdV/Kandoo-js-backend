/**
 * Created by Steven Gentens on 3/16/2017.
 */
class ChatMessageController {
    constructor() {
        this.chatMessageService = require('../services/chat-message-service');
    }

    addMessage(req, res) {
        let body = req.body;
        this.chatMessageService.addMessage(req.params.sessionId, body.userId, body.message)
            .then((messages) => res.sendStatus(204))
            .catch((err) => res.status(404).send({error: err.message}));
    }

    readMessagesBySessionId(req, res) {
        this.chatMessageService.getCardById(req.params.sessionId)
            .then((messages) => res.status(200).send({messages: messages}))
            .catch((err) => res.status(404).send({error: err.message}));
    }


}
module.exports = new ChatMessageController();