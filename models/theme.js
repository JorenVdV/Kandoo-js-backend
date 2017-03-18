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
    }]
}, {timestamps: true}, {minimize: true});

ThemeSchema.set('validateBeforeSave', true);
ThemeSchema.pre('findOneAndUpdate', function (next) {
    this.options.runValidators = true;
    next();
});

ThemeSchema.pre('remove', function (next) {
    this.model('Session').remove({theme: this._id})
        .then((result) => this.model('Card').remove({theme: this._id}, next()))
        .catch((err) => console.log(err));
});

module.exports = mongoose.model('Theme', ThemeSchema);