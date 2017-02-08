/**
 * Created by steve on 2/8/2017.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    firstname: String,
    lastname: String,
    dateOfBirth: Date,
    profilePicture: {data:Buffer, content: String},
    emailAddress: String
});

module.exports = mongoose.model('User', UserSchema);