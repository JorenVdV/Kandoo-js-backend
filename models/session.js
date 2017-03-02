/**
 * Created by steve on 2/8/2017.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SessionSchema = new Schema({
    title: String,
    description: String,
    circleType: {type: String,
        enum: {
            values: ['opportunity', 'threat'],
            message: 'Invalid circle type. Circle type should be "opportunity" or "threat".'
        },
        lowercase: true
    },
    turnDuration: Number,
    minCardsPerParticipant: Number,
    maxCardsPerParticipant: Number,
    amountOfCircles: Number,
    sessionCards: [{type: Schema.ObjectId, ref: 'Card'}],
    cardsCanBeReviewed: Boolean,
    cardsCanBeAdded: Boolean,
    participants: [{type: Schema.ObjectId, ref: 'User'}],
    invitees: [{type: Schema.ObjectId, ref: 'User'}],
    startDate: Date,
    endDate: Date,
    turns: [
        {
            priority: Number,
            card: {type: Schema.ObjectId, ref: 'Card'},
            user: {type: Schema.ObjectId, ref: 'User'},
            created: {type: Date, default: Date.now}

        }],
    currentUser: {type: Schema.ObjectId, ref: 'User'},
    theme: {
        type: Schema.ObjectId, ref: 'Theme'
    },
    creator: {
        type: Schema.ObjectId, ref: 'User'
    }
}, {timestamps: true}, {minimize: true});

SessionSchema.set('validateBeforeSave', true);

module.exports = mongoose.model('Session', SessionSchema);