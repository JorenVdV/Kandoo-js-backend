/**
 * Created by steve on 2/20/2017.
 */

const User = require('../models/user');
const Theme = require('../models/theme');
const Session = require('../models/session');

const mongoose = require('mongoose');
const config = require('../_config');

before('Open connection to test database', function (done) {
    if (mongoose.connection.readyState === 0) {
        mongoose.connect(config.mongoURI[process.env.NODE_ENV], function (err) {
            if (err) {
                console.log('Error connecting to the database. ' + err);
            } else {
                console.log('Connected to database: ' + config.mongoURI[process.env.NODE_ENV]);
            }
            done();
        });
    } else {
        console.log("Already connected to mongodb://" + mongoose.connection.host + ":" + mongoose.connection.port + "/" + mongoose.connection.name);
        done();
    }
});

before('Clear collections', function (done) {
    User.collection.drop();
    Theme.collection.drop();
    Session.collection.drop();
    console.log('====== Dropped collections ======');
    done();
});

after('Closing connection to test database', function (done) {
    mongoose.disconnect();
    console.log('====== Disconnected from database ======');
    done();
});