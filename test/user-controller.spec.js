/**
 * Created by steve on 2/10/2017.
 */
var chai = require('chai');
var chaiHttp = require('chai-http');
var assert = chai.assert;
var should = chai.should();
var server = require('../app');
const userService = require('../services/user-service');

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
                        userService.removeUser(userService.findUserByEmail('joren.vdv@kdg.be')._id);
                        done();
                    });
            });
        });
        describe('two users can not have the same email', function () {
            let user1 = {
                firstname: 'Joren',
                lastname: 'Van de Vondel',
                organisation: 'Big Industries',
                password: 'Pudding',
                emailAddress: 'joren.vdv1@kdg.be'
            };
            let user2 = {
                firstname: 'Joren2',
                lastname: 'Van de Vondel2',
                organisation: 'Big Industries',
                password: 'Pudding',
                emailAddress: 'joren.vdv1@kdg.be'
            };
            let user3 = {
                firstname: 'Joren',
                lastname: 'Van de Vondel',
                organisation: 'Big Industries',
                password: 'Pudding',
                emailAddress: 'joren.vdv2@kdg.be'
            };
            before('creating user1', function (done) {
                chai.request(server)
                    .post('/register')
                    .send(user1)
                    .end((err, res) => {
                        res.should.have.status(201);
                        done();
                    });
            });
            it('creating user2 should fail', function (done) {
                chai.request(server)
                    .post('/register')
                    .send(user2)
                    .end((err, res) => {
                        res.should.have.status(404);
                        res.body.should.have.property('error');
                        assert.strictEqual(res.body.error, 'Email address is already in use.', 'should have returned an error message');
                        done();
                    });
            });
            it('creating user3 should be succesful', function (done) {
                chai.request(server)
                    .post('/register')
                    .send(user3)
                    .end((err, res) => {
                        res.should.have.status(201);
                        done();
                    });
            });
            after('deleting the created users', function () {
                userService.removeUser(userService.findUserByEmail('joren.vdv1@kdg.be')._id);
                userService.removeUser(userService.findUserByEmail('joren.vdv2@kdg.be')._id);
            });
        });

    });
    describe('/GET users', function () {
        it('should get a single user', () => {
            let user = {
                firstname: 'Joren',
                lastname: 'Van de Vondel',
                organisation: 'Big Industries',
                password: 'Pudding',
                emailAddress: 'joren.vdv3@kdg.be'
            };
            chai.request(server)
                .post('/register')
                .send(user)
                .end((err, res) => {
                    res.should.have.status(201);

                    chai.request(server)
                        .get('/users')
                        .send()
                        .end((err, res) => {
                            console.log(res.body.users.map(u => u.emailAddress));
                            res.should.have.status(200);
                            res.body.should.have.property('users');
                            assert.strictEqual(res.body.users.length, 1, 'there should be a single user');
                            // remove the user again
                            userService.removeUser(res.body.users[0]._id);
                        });
                });
        });
    });
    describe('/POST login', function () {
        it('should login a user', (done) => {
            let user = {
                firstname: 'Joren',
                lastname: 'Van de Vondel',
                organisation: 'Big Industries',
                password: 'Pudding',
                emailAddress: 'joren.vdv4@kdg.be'
            };
            chai.request(server)
                .post('/register')
                .send(user)
                .end((err, res) => {
                    res.should.have.status(201);
                });
            chai.request(server)
                .post('/login')
                .send({emailAddress: 'joren.vdv4@kdg.be', password: 'Pudding'})
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.property('user');
                    assert.isOk(res.body.user, 'the user should be defined');
                    assert.strictEqual(res.body.user.firstname, 'Joren', 'User should have Joren as firstname');
                    userService.removeUser(res.body.user._id);
                    done();
                });
        });

    });
});