/**
 * Created by steve on 2/9/2017.
 */
const config = require('../../_config');
const mongoose = require('mongoose');
process.env.NODE_ENV = 'test';

const chai = require('chai');
const assert = chai.assert;

const userService = require('../../services/user-service');
const User = require('../../models/user');

describe('User service tests', function(){
    before('Open connection to test database', function(done){
        if(mongoose.connection.readyState === 0){
            mongoose.connect(config.mongoURI[process.env.NODE_ENV],function(err){
                if(err){
                    console.log('Error connecting to the database. ' + err);
                } else{
                    console.log('Connected to database: ' + config.mongoURI[process.env.NODE_ENV]);
                }
                done();
            });
        }else {
            console.log("Already connected to mongodb://" + mongoose.connection.host + ":" + mongoose.connection.port + "/" + mongoose.connection.name);
            done();
        }
    });

   it('Creating a user', function(){
       let user = userService.createUser('Jos', 'Van Camp', 'jos.vancamp@teamjs.xyz', 'Karel de Grote Hogeschool - TeamJS', 'myAwesomePassword.123');
       assert.strictEqual(user.firstname, 'Jos', 'the name of the user should be "Jos"');
       assert.strictEqual(user.lastname, 'Van Camp', 'the family name of the user should be "Van Camp"');
       assert.strictEqual(user.emailAddress, 'jos.vancamp@teamjs.xyz', 'the email address of the user should be "jos.vancamp@teamjs.xyz"');
       assert.strictEqual(user.organisation, 'Karel de Grote Hogeschool - TeamJS', 'the organisation of the user should be "Karel de Grote Hogeschool - TeamJS"');
       assert.strictEqual(user.password, 'myAwesomePassword.123', 'the password of the user should be "myAwesomePassword.123"');
       userService.removeUser(user._id);
       assert.isNotOk(userService.findUserById(user._id), 'User should have been removed');
   });

   it('Find a user by email', function(){
        let user = userService.createUser('Jos', 'Van Camp', 'jos.vancamp@teamjs.xyz', 'Karel de Grote Hogeschool - TeamJS', 'myAwesomePassword.123');
        let foundUser = userService.findUserByEmail(user.emailAddress);
        assert.strictEqual(foundUser._id,user._id, 'id of the found user should be the same as the created user');
        userService.removeUser(user._id);
   });
    it('Find doens\'t find user by email', function(){
        let user = userService.createUser('Jos', 'Van Camp', 'jos.vancamp@teamjs.xyz', 'Karel de Grote Hogeschool - TeamJS', 'myAwesomePassword.123');
        let foundUser = userService.findUserByEmail('jos.vancamp@.xyz');
        assert.isUndefined(foundUser, 'The user shouldn\'t have been found');
        userService.removeUser(user._id);
    });

    after('Closing connection to test database', function(done){
        mongoose.disconnect();
        done();
    });
});