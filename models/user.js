/**
 * Created by steve on 2/8/2017.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    firstname: {
        type: String,
        required: [true, 'Firstname is required'],
        minlength: [3, 'Firstname should contain more than 3 characters.']
    },
    lastname: {
        type: String,
        required: [true, 'Lastname is required'],
        minlength: [3, 'Lastname should contain more than 3 characters.']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [3, 'Password should contain more than 3 characters.']
    },
    securePassword: {
        type: String,
        required: [true, 'securePassword is required']
    },
    avatar: {data: Buffer, content: String},
    emailAddress: {
        type: String,
        required: [true, 'Email address is required'],
        match: [/^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/, '{VALUE} is not a valid email address!'],
        lowercase: true
    },
    organisation: String,
    settings: [],
}, {timestamps: true}, {minimize: true});

UserSchema.set('validateBeforeSave', true);

module.exports = mongoose.model('User', UserSchema);