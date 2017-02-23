/**
 * Created by steve on 2/10/2017.
 */
const mongoose = require('mongoose');
process.env.NODE_ENV = 'test';

var chai = require('chai');
var chaiHttp = require('chai-http');
var assert = chai.assert;
var should = chai.should();
var server = require('../../app-test');
const userService = require('../../services/user-service');

chai.use(chaiHttp);


describe('User Controller tests', function () {
    // before('Open connection to test database', function (done) {
    //     if (mongoose.connection.readyState === 0) {
    //         mongoose.connect(config.mongoURI[process.env.NODE_ENV], function (err) {
    //             if (err) {
    //                 console.log('Error connecting to the database. ' + err);
    //             } else {
    //                 console.log('Connected to database: ' + config.mongoURI[process.env.NODE_ENV]);
    //             }
    //             done();
    //         });
    //     } else {
    //         console.log("Already connected to mongodb://" + mongoose.connection.host + ":" + mongoose.connection.port + "/" + mongoose.connection.name);
    //         done();
    //     }
    // });

    describe('/POST register', function () {

        describe('creating a user', function () {
            it('should create a user', (done) => {
                let user = {
                    firstname: 'Joren',
                    lastname: 'Van de Vondel',
                    organisation: 'Big Industries',
                    password: 'Pudding',
                    emailAddress: 'joren.vdv@kdg.be'
                };
                chai.request(server)
                    .post('/register')
                    .send(user)
                    .end((err, res) => {
                        res.should.have.status(201);
                        done();
                    });
            });

            after('Remove created user', function (done) {
                userService.findUserByEmail('joren.vdv@kdg.be', function (user, err) {
                    assert.isNotOk(err);
                    assert.isOk(user, 'user should have been found');

                    userService.removeUser(user._id, function (succes, err) {
                        assert.isNotOk(err);
                        assert.isTrue(succes, 'user should have succesfully been deleted');
                        done();
                    });
                });
            });
        });

        describe('two users can not have the same email', function () {

            before('Creating a first user', function (done) {
                userService.createUser('Joren', 'Van de Vondel', 'joren.vdv@kdg.be', 'Big Industries', 'Pudding', function (user, err) {
                    assert.isNotOk(err);
                    assert.isOk(user);
                    done();
                });
            });

            it('Creating another user - same email', function (done) {
                let userToFail = {
                    firstname: 'Joren2',
                    lastname: 'Van de Vondel2',
                    organisation: 'Big Industries',
                    password: 'Pudding',
                    emailAddress: 'joren.vdv@kdg.be'
                };
                chai.request(server)
                    .post('/register')
                    .send(userToFail)
                    .end((err, res) => {
                        res.should.have.status(404);
                        res.body.should.have.property('error');
                        assert.strictEqual(res.body.error, 'Error: Email address is already in use', 'should have returned an error message');
                        done();
                    });
            });

            it('Creating another user - different email', function (done) {
                let userToSucceed = {
                    firstname: 'Joren',
                    lastname: 'Van de Vondel',
                    organisation: 'Big Industries',
                    password: 'Pudding',
                    emailAddress: 'joren.vdv1@kdg.be'
                };
                chai.request(server)
                    .post('/register')
                    .send(userToSucceed)
                    .end((err, res) => {
                        res.should.have.status(201);
                        done();
                    });
            });

            after('Remove the first created user', function (done) {
                userService.findUserByEmail('joren.vdv@kdg.be', function (user, err) {
                    assert.isNotOk(err);
                    assert.isOk(user, 'user should have been found');

                    userService.removeUser(user._id, function (succes, err) {
                        assert.isNotOk(err);
                        assert.isTrue(succes, 'user should have succesfully been deleted');
                        done();
                    });
                });
            });

            after('Remove the second created user', function (done) {
                userService.findUserByEmail('joren.vdv1@kdg.be', function (user, err) {
                    assert.isNotOk(err);
                    assert.isOk(user, 'user should have been found');

                    userService.removeUser(user._id, function (succes, err) {
                        assert.isNotOk(err);
                        assert.isTrue(succes, 'user should have succesfully been deleted');
                        done();
                    });
                });
            })
        });

    });

    describe('/GET users', function () {

        describe('Retrieving all users - no users:', function(){

            it('retrieving users', (done) => {
                chai.request(server)
                    .get('/users')
                    .send()
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.have.property('users');
                        assert.strictEqual(res.body.users.length, 0, 'there should be a single user');
                        done();
                    });
            });

        });

        describe('Retrieving all users - single user:', function(){
            before('Creating a user', function (done) {
                userService.createUser('Joren', 'Van de Vondel', 'joren.vdv@kdg.be', 'Big Industries', 'Pudding', function (user, err) {
                    assert.isNotOk(err);
                    assert.isOk(user);
                    done();
                });
            });

            it('retrieving users', (done) => {
                chai.request(server)
                    .get('/users')
                    .send()
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.have.property('users');
                        assert.strictEqual(res.body.users.length, 1, 'there should be a single user');
                        let user = res.body.users[0];
                        assert.strictEqual(user.emailAddress, 'joren.vdv@kdg.be');
                        done();
                    });
            });

            after('Remove created user', function (done) {
                userService.findUserByEmail('joren.vdv@kdg.be', function (user, err) {
                    assert.isNotOk(err);
                    assert.isOk(user, 'user should have been found');

                    userService.removeUser(user._id, function (succes, err) {
                        assert.isNotOk(err);
                        assert.isTrue(succes, 'user should have succesfully been deleted');
                        done();
                    });
                });
            });
        });

        describe('Retrieving all users - two users:', function(){
            before('Creating a user', function (done) {
                userService.createUser('Joren', 'Van de Vondel', 'joren.vdv@kdg.be', 'Big Industries', 'Pudding', function (user, err) {
                    assert.isNotOk(err);
                    assert.isOk(user);
                    done();
                });
            });

            before('Creating another user', function (done) {
                userService.createUser('Joren', 'Van de Vondel', 'joren.vdv1@kdg.be', 'Big Industries', 'Pudding', function (user, err) {
                    assert.isNotOk(err);
                    assert.isOk(user);
                    done();
                });
            });

            it('retrieving users', (done) => {
                chai.request(server)
                    .get('/users')
                    .send()
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.have.property('users');
                        assert.strictEqual(res.body.users.length, 2, 'there should be a single user');
                        let user = res.body.users[0];
                        let user2 = res.body.users[1];
                        assert.strictEqual(user.emailAddress, 'joren.vdv@kdg.be');
                        assert.strictEqual(user2.emailAddress, 'joren.vdv1@kdg.be');
                        done();
                    });
            });

            after('Remove first created user', function (done) {
                userService.findUserByEmail('joren.vdv@kdg.be', function (user, err) {
                    assert.isNotOk(err);
                    assert.isOk(user, 'user should have been found');

                    userService.removeUser(user._id, function (succes, err) {
                        assert.isNotOk(err);
                        assert.isTrue(succes, 'user should have succesfully been deleted');
                        done();
                    });
                });
            });

            after('Remove second created user', function (done) {
                userService.findUserByEmail('joren.vdv1@kdg.be', function (user, err) {
                    assert.isNotOk(err);
                    assert.isOk(user, 'user should have been found');

                    userService.removeUser(user._id, function (succes, err) {
                        assert.isNotOk(err);
                        assert.isTrue(succes, 'user should have succesfully been deleted');
                        done();
                    });
                });
            });
        });

    });

    describe('/POST login', function () {
        let LOGINUser_user;
        before('Creating a user', function (done) {
            userService.createUser('Joren', 'Van de Vondel', 'joren.vdv@kdg.be', 'Big Industries', 'Pudding', function (user, err) {
                assert.isNotOk(err);
                assert.isOk(user);
                LOGINUser_user = user;
                done();
            });
        });

        it('login - correct credentials', function(done){
            chai.request(server)
                .post('/login')
                .send({emailAddress: 'joren.vdv@kdg.be', password: 'Pudding'})
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.property('user');
                    assert.isOk(res.body.user, 'the user should be defined');
                    assert.strictEqual(res.body.user.firstname, LOGINUser_user.firstname);
                    assert.strictEqual(res.body.user.lastname, LOGINUser_user.lastname);
                    assert.strictEqual(res.body.user.emailAddress, LOGINUser_user.emailAddress);
                    assert.strictEqual(res.body.user.password, LOGINUser_user.password);
                    assert.strictEqual(res.body.user.organisation, LOGINUser_user.organisation);
                    done();
                });
        });

        it('login - wrong password', function(done){
            chai.request(server)
                .post('/login')
                .send({emailAddress: 'joren.vdv@kdg.be', password: 'Pudding.123'})
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.have.property('error');
                    assert.isOk(res.body.error);
                    assert.strictEqual(res.body.error, 'Password is incorrect');
                    done();
                });
        });

        it('login - non existent user', function(done){
            chai.request(server)
                .post('/login')
                .send({emailAddress: 'joren.vdv1@kdg.be', password: 'Pudding'})
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.should.have.property('error');
                    assert.isOk(res.body.error);
                    assert.strictEqual(res.body.error, 'Unable to find user with email: joren.vdv1@kdg.be');
                    done();
                });
        });

        after('Remove created user', function (done) {
            userService.findUserByEmail('joren.vdv@kdg.be', function (user, err) {
                assert.isNotOk(err);
                assert.isOk(user, 'user should have been found');

                userService.removeUser(user._id, function (succes, err) {
                    assert.isNotOk(err);
                    assert.isTrue(succes, 'user should have succesfully been deleted');
                    done();
                });
            });
        });
    });

    describe('/DELETE delete', function(){
        let DELETEUser_user;

        before('Creating a user', function (done) {
            userService.createUser('Joren', 'Van de Vondel', 'joren.vdv@kdg.be', 'Big Industries', 'Pudding', function (user, err) {
                assert.isNotOk(err);
                assert.isOk(user);
                DELETEUser_user = user;
                done();
            });
        });

        it('Removing the user', function(done){
            chai.request(server)
                .delete('/user/' + DELETEUser_user._id + '/delete')
                .send()
                .end((err, res) => {
                    res.should.have.status(204);
                    done();
                });
        });

        it('Removing a non existent user', function(done){
            chai.request(server)
                .delete('/user/' + '00aa0aa000a000000a0000aa' + '/delete')
                .send()
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.should.have.property('error');
                    assert.strictEqual(res.body.error, 'Id does not exist');
                    done();
                });
        });
    });

    // after('Closing connection to test database', function (done) {
    //     mongoose.disconnect();
    //     done();
    // });
});