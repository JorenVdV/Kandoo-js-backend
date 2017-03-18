/**
 * Created by Steven Gentens on 3/16/2017.
 */
let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let ChatMessageSchema = new Schema({
    user: {type: Schema.ObjectId, ref: 'User', required: true},
    session: {type: Schema.ObjectId, ref: 'Session', required: true},
    content: {
        type: String,
        required: [true, 'a message is required'],
        minlength: [1, 'message should contain at least 1 character']
    }
}, {timestamps: true});

ChatMessageSchema.set('validateBeforeSave', true);

module.exports = mongoose.model('ChatMessage', ChatMessageSchema);