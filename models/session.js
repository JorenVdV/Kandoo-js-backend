/**
 * Created by steve on 2/8/2017.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SessionSchema = new Schema({
    title: String,
    description: String,
    circleType: {
        type: String,
        enum: {
            values: ['opportunity', 'threat'],
            message: 'Invalid circle type. Circle type should be "opportunity" or "threat".'
        },
        lowercase: true
    },
    minCardsPerParticipant: Number,
    maxCardsPerParticipant: Number,
    turnDuration: Number,
    amountOfCircles: Number,
    sessionCards: [{type: Schema.ObjectId, ref: 'Card'}],
    pickedCards: [{
        userId: {type: Schema.ObjectId, ref: 'User'},
        cards: [{type: Schema.ObjectId, ref: 'Card'}]
    }],
    cardPriorities: [{
        priority: Number,
        card: {type: Schema.ObjectId, ref: 'Card'},
        circlePosition: String
    }],
    cardsCanBeReviewed: Boolean,
    cardsCanBeAdded: Boolean,
    participants: [{type: Schema.ObjectId, ref: 'User'}],
    invitees: [{
        type: String,
        match: [/^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/, '{VALUE} is not a valid email address!'],
        lowercase: true
    }],
    startDate: Date,
    endDate: Date,
    events: [{
        eventType: {
            type: String, required: true, enum: ['start', 'pause', 'stop', 'turn', 'message'],
            message: 'Invalid event type. Event type should be "message", "start", "pause", "stop" or "turn".'
        },
        userId: {type: Schema.ObjectId, ref: 'User', required: true},
        content: Schema.Types.Mixed,
        timestamp: {type: Date, default: Date.now}
    }],
    status: {type: String, enum: ['created', 'started', 'paused', 'finished'], required: true},
    currentUser: {type: Schema.ObjectId, ref: 'User'},
    theme: {
        type: Schema.ObjectId, ref: 'Theme'
    },
    creator: {
        type: Schema.ObjectId, ref: 'User'
    }
}, {timestamps: true}, {minimize: true});

SessionSchema.set('validateBeforeSave', true);
SessionSchema.pre('findOneAndUpdate', function (next) {
    this.options.runValidators = true;
    next();
});

module.exports = mongoose.model('Session', SessionSchema);