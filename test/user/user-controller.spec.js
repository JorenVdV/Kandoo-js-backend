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
const bcrypt = require('bcrypt');

chai.use(chaiHttp);


describe('User Controller tests', function () {

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

            after('Remove created user', async function () {
                let user = await userService.getUserByEmail('joren.vdv@kdg.be');
                assert.isOk(user);

                let successful = await userService.removeUser(user._id);
                assert.isTrue(successful);
            });
        });
    });

    describe('two users can not have the same email', function () {

        before('Creating a first user', async function () {
            let user = await userService.addUser('Joren', 'Van de Vondel', 'joren.vdv@kdg.be', 'Big Industries', 'Pudding');
            assert.isOk(user);
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
                    assert.strictEqual(res.body.error, 'Email address is already in use');
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

        after('Remove the created users', async function () {
            let user = await userService.getUserByEmail('joren.vdv@kdg.be');
            assert.isOk(user);

            let successful = await userService.removeUser(user._id);
            assert.isTrue(successful);

            user = await userService.getUserByEmail('joren.vdv1@kdg.be');
            assert.isOk(user);

            successful = await userService.removeUser(user._id);
            assert.isTrue(successful);
        });
    });

    describe('/GET users', function () {

        describe('Retrieving all users - no users:', function () {
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

        describe('Retrieving all users - single user:', function () {
            before('Creating a user', async function () {
                let user = await userService.addUser('Joren', 'Van de Vondel', 'joren.vdv@kdg.be', 'Big Industries', 'Pudding');
                assert.isOk(user);
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

            after('Remove created user', async function () {
                let user = await userService.getUserByEmail('joren.vdv@kdg.be');
                assert.isOk(user);

                let successful = await userService.removeUser(user._id);
                assert.isTrue(successful);
            });
        });

        describe('Retrieving all users - two users:', function () {
            before('Creating the users', async function () {
                let user = await userService.addUser('Joren', 'Van de Vondel', 'joren.vdv@kdg.be', 'Big Industries', 'Pudding');
                assert.isOk(user);

                user = await userService.addUser('Joren', 'Van de Vondel', 'joren.vdv1@kdg.be', 'Big Industries', 'Pudding');
                assert.isOk(user);
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

            after('Remove created users', async function () {
                let user = await userService.getUserByEmail('joren.vdv@kdg.be');
                assert.isOk(user);

                let successful = await userService.removeUser(user._id);
                assert.isTrue(successful);

                user = await userService.getUserByEmail('joren.vdv1@kdg.be');
                assert.isOk(user);

                successful = await userService.removeUser(user._id);
                assert.isTrue(successful);
            });
        });


        describe('/POST login', function () {
            let LOGINUser_user;
            before('Creating a user', async function () {
                LOGINUser_user = await userService.addUser('Joren', 'Van de Vondel', 'joren.vdv@kdg.be', 'Big Industries', 'Pudding');
                assert.isOk(LOGINUser_user);
            });

            it('login - correct credentials', function (done) {
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
                        // assert.strictEqual(res.body.user.password, LOGINUser_user.password);
                        assert.strictEqual(res.body.user.organisation, LOGINUser_user.organisation);
                        done();
                    });
            });

            it('login - wrong password', function (done) {
                chai.request(server)
                    .post('/login')
                    .send({emailAddress: 'joren.vdv@kdg.be', password: 'Pudding.123'})
                    .end((err, res) => {
                        res.should.have.status(404);
                        res.body.should.have.property('error');
                        assert.isOk(res.body.error);
                        assert.strictEqual(res.body.error, 'Email address or password is incorrect');
                        done();
                    });
            });

            it('login - non existent user', function (done) {
                chai.request(server)
                    .post('/login')
                    .send({emailAddress: 'joren.vdv1@kdg.be', password: 'Pudding'})
                    .end((err, res) => {
                        res.should.have.status(404);
                        res.body.should.have.property('error');
                        assert.isOk(res.body.error);
                        assert.strictEqual(res.body.error, 'Email address or password is incorrect');
                        done();
                    });
            });

            after('Remove created user', async function () {
                let user = await userService.getUserByEmail('joren.vdv@kdg.be');
                assert.isOk(user);

                let successful = await userService.removeUser(user._id);
                assert.isTrue(successful);
            });
        });

        describe('/DELETE delete', function () {
            let DELETEUser_user;

            before('Creating a user', async function () {
                DELETEUser_user = await userService.addUser('Joren', 'Van de Vondel', 'joren.vdv@kdg.be', 'Big Industries', 'Pudding');
                assert.isOk(DELETEUser_user);
            });

            it('Removing the user', function (done) {
                chai.request(server)
                    .delete('/user/' + DELETEUser_user._id + '/delete')
                    .send()
                    .end((err, res) => {
                        res.should.have.status(204);
                        done();
                    });
            });

            it('Removing a non existent user', function (done) {
                chai.request(server)
                    .delete('/user/' + '00aa0aa000a000000a0000aa' + '/delete')
                    .send()
                    .end((err, res) => {
                        res.should.have.status(404);
                        res.body.should.have.property('error');
                        assert.strictEqual(res.body.error, 'Unable to find user with id: ' + '00aa0aa000a000000a0000aa');
                        done();
                    });
            });
        });
    });

    describe('/PUT user/:userId/update - password', function(){
        let user;
        before('Create the user', async() => {
            user = await userService.addUser('Jos', 'Van Camp', 'jos.vancamp@teamjs.xyz', 'Karel de Grote Hogeschool - TeamJS', 'myAwesomePassword.123');
            assert.isOk(user);
        });

        it('Update the users password', (done) => {
            let updates = {password: 'EenLeukNieuwWW'};
            chai.request(server)
                .put('/user/' + user._id + '/update')
                .send(updates)
                .end((err,res) => {
                    res.should.have.status(200);
                    res.body.should.have.property('user');
                    let newUser = res.body.user;
                    assert.isOk(newUser);
                    assert.strictEqual(newUser.emailAddress, 'jos.vancamp@teamjs.xyz');
                    done();
                });
        });

        after('Validate whether the password has been updated', (done) => {
            chai.request(server)
                .post('/login')
                .send({emailAddress: 'jos.vancamp@teamjs.xyz', password: 'EenLeukNieuwWW'})
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.property('user');
                    assert.isOk(res.body.user, 'the user should be defined');
                    assert.strictEqual(res.body.user.emailAddress, 'jos.vancamp@teamjs.xyz');
                    done();
                });
        });

        after('Remove the user', async () => {
            let successful = await userService.removeUser(user._id);
            assert.isTrue(successful);
        })
    });

    describe('/PUT user/:userId/update', function () {
        let user;
        beforeEach('Create the user', async() => {
            user = await userService.addUser('Jos', 'Van Camp', 'jos.vancamp@teamjs.xyz', 'Karel de Grote Hogeschool - TeamJS', 'myAwesomePassword.123');
            assert.isOk(user);
        });

        it('Update multiple user fields', (done) => {
            let updates = {firstname: 'Jonas', lastname: 'Janoke'};
            chai.request(server)
                .put('/user/' + user._id + '/update')
                .send(updates)
                .end((err,res) => {
                    res.should.have.status(200);
                    res.body.should.have.property('user');
                    let newUser = res.body.user;
                    assert.isOk(newUser);
                    assert.strictEqual(newUser.firstname, updates.firstname);
                    assert.strictEqual(newUser.lastname, updates.lastname);
                    assert.strictEqual(newUser.emailAddress, user.emailAddress);
                    assert.strictEqual(newUser.organisation, user.organisation);
                    done();
                });
        });

        it('Update a single field', (done) => {
            let updates = {firstname: 'Jommeke'};
            chai.request(server)
                .put('/user/' + user._id + '/update')
                .send(updates)
                .end((err,res) => {
                    res.should.have.status(200);
                    res.body.should.have.property('user');
                    let newUser = res.body.user;
                    assert.isOk(newUser);
                    assert.strictEqual(newUser.firstname, updates.firstname);
                    assert.strictEqual(newUser.lastname, user.lastname);
                    assert.strictEqual(newUser.emailAddress, user.emailAddress);
                    assert.strictEqual(newUser.organisation, user.organisation);
                    done();
                });
        });

        afterEach('Remove the user', async() => {
            let successful = await userService.removeUser(user._id);
            assert.isTrue(successful);
        });
    });
});