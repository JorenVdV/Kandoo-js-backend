/**
 * Created by steve on 2/6/2017.
 */
let config = {};

config.mongoURI = {
    production: 'mongodb://teamjs:team.js@146.185.153.213:27017/teamjs',
    test: 'mongodb://teamjs:team.js@146.185.153.213:27017/teamjs_test'
};

config.mailCredentials = {
    service: 'gmail',
    emailAddress: 'teamjsip2@gmail.com',
    password:'myAwesomePassword.123'
};

// config.options = {
//     user: 'teamjs',
//     pass: 'team.js'
// };

module.exports = config;