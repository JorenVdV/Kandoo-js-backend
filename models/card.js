/**
 * Created by steve on 2/8/2017.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CardSchema = new Schema({
    description: String,
    created: {
        type: Date, default: Date.now
    }
});

module.exports = mongoose.model('Card', CardSchema);