/**
 * Created by steve on 2/8/2017.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CardSchema = new Schema({
    description: String,
    theme: {type: Schema.ObjectId, ref: 'Theme'}
}, {timestamps: true}, {minimize: true});

CardSchema.set('validateBeforeSave', true);

module.exports = mongoose.model('Card', CardSchema);