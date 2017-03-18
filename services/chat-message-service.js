/**
 * Created by Steven Gentens on 3/16/2017.
 */

let ChatMessage = require('../models/chat-message');
let chatMessageService = require('../services/chat-message-service');

class ChatMessageService {
    constructor() {
        this.chatMessageRepo = require('../repositories/chat-message-repository');
    }

    async addMessage(sessionId, userId, messageContent){
        let message = new ChatMessage();
        message.session = sessionId;
        message.user = userId;
        message.content = messageContent;
        return await this.chatMessageRepo.createMessage(message);
    }

    async getMessagesBySessionId(sessionId, limit) {
        return await this.chatMessageRepo.readMessagesBySessionId(sessionId, limit);
    }

}

module.exports = new ChatMessageService();