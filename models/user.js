/**
 * Created by steve on 2/8/2017.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    firstname: String,
    lastname: String,
    password: String,
    avatar: {data:Buffer, content: String},
    emailAddress: String,
    organisation: String,
    settings: [],
});

module.exports = mongoose.model('User', UserSchema);