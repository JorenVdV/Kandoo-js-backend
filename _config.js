/**
 * Created by steve on 2/6/2017.
 */
const User = require("./models/user");
let config = {};

config.mongoURI = {
    production: 'mongodb://teamjs:team.js@146.185.153.213:27017/teamjs',
    test: 'mongodb://teamjs:team.js@146.185.153.213:27017/teamjs_test'
};

config.initialUser = new User();
config.initialUser.firstname = "Puddingtje";
config.initialUser.lastname = "Puddingske";
config.initialUser.emailAddress = "pudding@puddingCorp.com";
config.initialUser.organisation = "Pudding Corp.";
config.initialUser.password = "Pudding.123!";

// config.options = {
//     user: 'teamjs',
//     pass: 'team.js'
// };

module.exports = config;