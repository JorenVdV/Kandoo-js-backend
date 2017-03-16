/**
 * Created by steve on 2/6/2017.
 */
let config = {};

config.mongoURI = {
    production: 'mongodb://teamjs:team.js@146.185.153.213:27017/teamjs',
    test: 'mongodb://teamjs:team.js@146.185.153.213:27017/teamjs_test'//'mongodb://localhost:27021/test_local_ip2'//
};

config.mailCredentials = {
    service: 'gmail',
    emailAddress: 'teamjsip2@gmail.com',
    password:'myAwesomePassword.123'
};

config.jwt = {
    secret: '93MepG56l5o9c7Ui1y57pdE65',
    options : {
        expiresIn: "12h",
        issuer: "teamjs.xyz"
    }
};
// config.options = {
//     user: 'teamjs',
//     pass: 'team.js'
// };

module.exports = config;