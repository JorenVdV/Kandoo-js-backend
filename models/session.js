/**
 * Created by steve on 2/8/2017.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SessionSchema = new Schema({
    title: String,
    description: String,
    circleType: String,
    roundDuration: Number,
    cardsPerParticipant: {
        min: Number,
        max: Number
    },
    cards: [{type:Schema.ObjectId, ref:'Card'}],
    canReview: Boolean,
    canAddCards : Boolean,
    participants: [{type: Schema.ObjectId, ref:'User'}],
    startDate: Date,
    theme: {
        type: Schema.ObjectId, ref: 'Theme'
    },
    creator: {
        type: Schema.ObjectId, ref: 'User'
    },
    created: {
        type: Date, default: Date.now
    }
});

module.exports = mongoose.model('Session', SessionSchema);