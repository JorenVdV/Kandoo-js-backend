/**
 * Created by Steven Gentens on 3/16/2017.
 */
/**
 * Created by nick on 10/02/17.
 */
const ChatMessage = require('../models/chat-message');

class ChatMessageRepository {
    constructor() {
        this.chatDao = ChatMessage;

    }

    async createMessage(message) {
        try {
            await message.save();
        } catch (err) {
            throw new Error('Unexpected error occurred. ' + err);
        }
        return message;
    }

    async readMessagesBySessionId(sessionId, messageLimit) {
        let messages;
        try {
            if (messageLimit)
                messages = await this.chatDao.find({session: sessionId}).populate('user', 'firstname lastname').sort({createdAt: -1}).limit(messageLimit);
            else
                messages = await this.chatDao.find({session: sessionId}).populate('user', 'firstname lastname');
        } catch (err) {
            throw new Error('Unexpected error occurred. ' + err);
        }

        let messagesArray = [];
        messages.forEach((message) => {
            messagesArray.push(message);
        });
        return messagesArray.sort((msgA, msgB) => {
            return +(new Date(msgA)) > +(new Date(msgB));
        });
    }

}

module.exports = new ChatMessageRepository();