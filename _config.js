/**
 * Created by steve on 2/6/2017.
 */

let config = {};

config.mongoURI = {
    development: 'mongodb://146.185.153.213:27017/teamjs',
    test: 'mongodb://146.185.153.213:27017/teamjs_test'
};

config.options = {
    user: 'teamjs',
    pass: 'team.js'
};

module.exports = config;