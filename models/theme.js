/**
 * Created by steve on 2/8/2017.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ThemeSchema = new Schema({
    title: String,
    description: String,
    tags: [String],
    isPublic: Boolean,
    organisers: [{
        type: Schema.ObjectId, ref: 'User'
    }],
    cards: [{
        type: Schema.ObjectId, ref: 'Card'
    }],
    created: {
        type: Date, default: Date.now
    }
});

module.exports = mongoose.model('Theme', ThemeSchema);