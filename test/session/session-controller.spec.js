/**
 * Created by steve on 2/10/2017.
 */
const config = require('../../_config');
const mongoose = require('mongoose');
process.env.NODE_ENV = 'test';

var chai = require('chai');
var chaiHttp = require('chai-http');
var assert = chai.assert;
var should = chai.should();
var server = require('../../app-test');
var themeService = require('../../services/theme-service');
var userService = require('../../services/user-service');
var cardService = require('../../services/card-service');
var sessionService = require('../../services/session-service');

chai.use(chaiHttp);

describe('Session Controller tests', function () {
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
    let globalTestTheme;
    let globalTestUser;
    before('create a testUser', function (done) {
        userService.createUser('test', 'user', 'test.user@teamjs.xyz', 'TeamJS', 'test', function (user, err) {
            assert.isNotOk(err);
            assert.isOk(user);
            globalTestUser = user;
            done();
        });
    });

    before('create a theme to create sessions on', function (done) {
        globalTestTheme = themeService.addTheme('testTheme', 'a theme to use in the test', 'test', 'false', globalTestUser, []);
        done();
    });

    describe('/POST /theme/:themeId/session', function () {
        describe('should create a session', function () {
            let sessionId;

            it('should create a session', function (done) {
                let session = {
                    title: 'Welke pudding eten we deze week?',
                    description: 'Test om sessie aan te maken',
                    circleType: 'blue',
                    turnDuration: 60000,
                    cardsPerParticipant: {min: 2, max: 5},
                    cards: [],
                    cardsCanBeReviewed: false,
                    cardsCanBeAdded: false,
                    creator: globalTestUser,
                    startDate: null
                };
                chai.request(server)
                    .post('/theme/' + globalTestTheme._id + '/session')
                    .send(session)
                    .end((err, res) => {
                        res.should.have.status(201);
                        res.body.should.have.property('session');
                        let resSession = res.body.session;
                        assert.isOk(resSession, 'the session should be defined');
                        assert.strictEqual(resSession.title, 'Welke pudding eten we deze week?', 'session title should be "Welke pudding eten we deze week"');
                        assert.equal(resSession.creator, globalTestUser._id, 'creator should have the same id as globaltestuser');
                        this.sessionId = resSession._id;
                        done();
                    });
            });
            it('should delete the session', function (done) {
                chai.request(server)
                    .delete('/session/' + this.sessionId + '/delete')
                    .end((err, res) => {
                        res.should.have.status(204);
                        done();
                    });
            });
        });
    });

    describe('/DELETE /session/:sessionId/delete', function () {
        let sessionId;
        it('should create a session', function (done) {
            let session = {
                title: 'Welke pudding eten we deze week?',
                description: 'Test om sessie aan te maken',
                circleType: 'blue',
                turnDuration: 60000,
                cardsPerParticipant: {min: 2, max: 5},
                cards: [],
                cardsCanBeReviewed: false,
                cardsCanBeAdded: false,
                creator: globalTestUser,
                startDate: null
            };
            chai.request(server)
                .post('/theme/' + globalTestTheme._id + '/session')
                .send(session)
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.have.property('session');
                    let resSession = res.body.session;
                    assert.isOk(resSession, 'the session should be defined');
                    assert.strictEqual(resSession.title, 'Welke pudding eten we deze week?', 'session title should be "Welke pudding eten we deze week"');
                    assert.equal(resSession.creator, globalTestUser._id, 'creator should have the same id as globaltestuser');
                    this.sessionId = resSession._id;
                    done();
                });

        });
        after('clean up created session', function (done) {
            chai.request(server)
                .delete('/session/' + this.sessionId + '/delete')
                .end((err, res) => {
                    res.should.have.status(204);
                    done();
                });
        });
    });

    describe('/GET  /session/:sessionId', function () {
        let sessionId;
        before('should create a session to use', function (done) {
            let session = {
                title: 'Welke pudding eten we deze week?',
                description: 'Test om sessie aan te maken',
                circleType: 'blue',
                turnDuration: 60000,
                cardsPerParticipant: {min: 2, max: 5},
                cards: [],
                cardsCanBeReviewed: false,
                cardsCanBeAdded: false,
                creator: globalTestUser,
                startDate: null
            };
            chai.request(server)
                .post('/theme/' + globalTestTheme._id + '/session')
                .send(session)
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.have.property('session');
                    let resSession = res.body.session;
                    assert.isOk(resSession, 'the session should be defined');
                    assert.strictEqual(resSession.title, 'Welke pudding eten we deze week?', 'session title should be "Welke pudding eten we deze week"');
                    assert.equal(resSession.creator, globalTestUser._id, 'creator should have the same id as globaltestuser');
                    this.sessionId = resSession._id;
                    done();
                });
        });
        it('should get a session', function (done) {
            chai.request(server)
                .get('/session/' + this.sessionId)
                .send()
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.property('session');
                    let resSession1 = res.body.session;
                    assert.isOk(resSession1, 'the session should be defined');
                    assert.strictEqual(resSession1.title, 'Welke pudding eten we deze week?', 'session title should be "Welke pudding eten we deze week"');
                    assert.equal(resSession1.creator, globalTestUser._id, 'creator should have the same id as globaltestuser');
                    assert.equal(resSession1._id, this.sessionId, 'id should be "' + this.sessionId + '"');
                    done();
                });
        });
        after('clean up created session', function (done) {
            chai.request(server)
                .delete('/session/' + this.sessionId + '/delete')
                .end((err, res) => {
                    res.should.have.status(204);
                    done();
                });
        });
    });

    describe('/GET /theme/:themeId/sessions', function () {
        describe('get all sessions with one existing session', function () {
            let sessionId;
            before('should create a session to use', function (done) {
                let session = {
                    title: 'Welke pudding eten we deze week?',
                    description: 'Test om sessie aan te maken',
                    circleType: 'blue',
                    turnDuration: 60000,
                    cardsPerParticipant: {min: 2, max: 5},
                    cards: [],
                    cardsCanBeReviewed: false,
                    cardsCanBeAdded: false,
                    creator: globalTestUser,
                    startDate: null
                };
                chai.request(server)
                    .post('/theme/' + globalTestTheme._id + '/session')
                    .send(session)
                    .end((err, res) => {
                        res.should.have.status(201);
                        res.body.should.have.property('session');
                        let resSession = res.body.session;
                        assert.isOk(resSession, 'the session should be defined');
                        assert.strictEqual(resSession.title, 'Welke pudding eten we deze week?', 'session title should be "Welke pudding eten we deze week"');
                        assert.equal(resSession.creator, globalTestUser._id, 'creator should have the same id as globaltestuser');
                        this.sessionId = resSession._id;
                        done();
                    });
            });
            it('find all sessions (1 session)', function (done) {
                chai.request(server)
                    .get('/theme/' + globalTestTheme._id + '/sessions')
                    .send()
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.have.property('sessions');
                        let resSessions = res.body.sessions;
                        assert.isArray(resSessions, 'should have received an array');
                        assert.strictEqual(resSessions.length, 1, 'there should be one session');
                        assert.equal(resSessions[0]._id, this.sessionId, 'id should be "' + this.sessionId + '"');
                        assert.equal(resSessions[0].creator, globalTestUser._id, 'creator of the session should have the same id as globaltestuser');
                        done();
                    });
            });
            after('clean up created session', function (done) {
                sessionService.deleteSession(this.sessionId);
                done();
            });
        });

        describe('get all sessions with two existing sessions', function () {
            let sessionIds;
            before('should create a session to use', function (done) {
                this.sessionIds = [];
                let session = {
                    title: 'Welke pudding eten we deze week?',
                    description: 'Test om sessie aan te maken',
                    circleType: 'blue',
                    turnDuration: 60000,
                    cardsPerParticipant: {min: 2, max: 5},
                    cards: [],
                    cardsCanBeReviewed: false,
                    cardsCanBeAdded: false,
                    creator: globalTestUser,
                    startDate: null
                };
                chai.request(server)
                    .post('/theme/' + globalTestTheme._id + '/session')
                    .send(session)
                    .end((err, res) => {
                        res.should.have.status(201);
                        res.body.should.have.property('session');
                        let resSession = res.body.session;
                        assert.isOk(resSession, 'the session should be defined');
                        assert.strictEqual(resSession.title, 'Welke pudding eten we deze week?', 'session title should be "Welke pudding eten we deze week"');
                        assert.equal(resSession.creator, globalTestUser._id, 'creator should have the same id as globaltestuser');
                        this.sessionIds.push(resSession._id);
                    });
                session.title = 'Welke pudding eten we volgende week?';
                session.description = 'Test om meerdere sessies aan te maken en terug te vinden';
                chai.request(server)
                    .post('/theme/' + globalTestTheme._id + '/session')
                    .send(session)
                    .end((err, res) => {
                        res.should.have.status(201);
                        res.body.should.have.property('session');
                        let resSession = res.body.session;
                        assert.isOk(resSession, 'the session should be defined');
                        assert.strictEqual(resSession.title, 'Welke pudding eten we volgende week?', 'session title should be "Welke pudding eten we deze week"');
                        assert.equal(resSession.creator, globalTestUser._id, 'creator should have the same id as globaltestuser');
                        this.sessionIds.push(resSession._id);
                        done();
                    });
            });
            it('find all sessions (2 sessions)', function (done) {
                chai.request(server)
                    .get('/theme/' + globalTestTheme._id + '/sessions')
                    .send()
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.have.property('sessions');
                        let resSessions = res.body.sessions;
                        assert.isArray(resSessions, 'should have received an array');
                        assert.strictEqual(resSessions.length, 2, 'there should be two session');
                        assert.equal(resSessions[0]._id, this.sessionIds[0], 'id should be "' + this.sessionId + '"');
                        assert.equal(resSessions[0].creator, globalTestUser._id, 'creator of the session should have the same id as globaltestuser');
                        assert.equal(resSessions[1]._id, this.sessionIds[1], 'id should be "' + this.sessionId + '"');
                        assert.equal(resSessions[1].creator, globalTestUser._id, 'creator of the session should have the same id as globaltestuser');
                        done();
                    });
            });
            after('clean up created sessions', function () {
                it('delete the first session', function (done) {
                    sessionService.deleteSession(this.sessionIds[0]);
                    done();
                });
                it('delete the second session', function (done) {
                    sessionService.deleteSession(this.sessionIds[1]);
                    done();
                });

            });
        })
    });

    describe('/POST /session/:sessionId/turn', function () {
        let sessionId;
        let card;
        before('should create a session to use and add a card to the theme', function (done) {
            this.sessionId = 0;
            let session = {
                title: 'Welke pudding eten we deze week?',
                description: 'Test om sessie aan te maken',
                circleType: 'blue',
                turnDuration: 60000,
                cardsPerParticipant: {min: 2, max: 5},
                cards: [],
                cardsCanBeReviewed: false,
                cardsCanBeAdded: false,
                creator: globalTestUser,
                startDate: null
            };
            chai.request(server)
                .post('/theme/' + globalTestTheme._id + '/session')
                .send(session)
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.have.property('session');
                    let resSession = res.body.session;
                    this.sessionId = resSession._id;
                    done();
                });


            card = {description: 'This is a test description'};
            card = cardService.addCard(card.description);
            themeService.addCard(globalTestTheme._id, card);

        });
        it('should add a turn to the session', function (done) {
            chai.request(server)
                .post('/session/' + this.sessionId + '/turn')
                .send({userId: globalTestUser._id, cardId: card._id})
                .end((err, res) => {
                    res.should.have.status(201);
                    done();
                });
        });
        after('clean up created stuff', function () {
            sessionService.deleteSession(sessionId);
        });
    });

    //TODO fix invite a user
    console.error('###########################');
    console.error('# TODO: fix invite a user #');
    console.error('###########################');
    // describe('/POST /session/:sessionId/invite', function () {
    //     let session;
    //     before('should create a session to use', function (done) {
    //
    //         let session = {
    //             title: 'Welke pudding eten we deze week?',
    //             description: 'Test om sessie aan te maken',
    //             circleType: 'blue',
    //             turnDuration: 60000,
    //             cardsPerParticipant: {min: 2, max: 5},
    //             cards: [],
    //             cardsCanBeReviewed: false,
    //             cardsCanBeAdded: false,
    //             creator: globalTestUser,
    //             startDate: null
    //         };
    //         chai.request(server)
    //             .post('/theme/' + globalTestTheme._id + '/session')
    //             .send(session)
    //             .end((err, res) => {
    //                 res.should.have.status(201);
    //                 res.body.should.have.property('session');
    //                 let resSession = res.body.session;
    //                 this.sessionId = resSession._id;
    //                 done();
    //             });
    //
    //
    //     });
    //     it('should add a user to the list of invitees', function (done) {
    //         chai.request(server)
    //
    //             .post('/session/' + this.sessionId + '/invite')
    //             .send({userId: globalTestUser._id})
    //             .end((err, res) => {
    //                 res.should.have.status(201);
    //             });
    //
    //
    //
    //         chai.request(server)
    //             .get('/session/' + this.sessionId)
    //             .send()
    //             .end((err, res) => {
    //                 res.should.have.status(200);
    //                 res.body.should.have.property('session');
    //                 let resSession1 = res.body.session;
    //                 assert.equal(globalTestUser._id, resSession1.invitees[0], 'the Id\'s should match');
    //                 done();
    //             });
    //
    //
    //
    //     });
    //     after('clean up created stuff', function () {
    //         it('delete  session', function () {
    //             sessionService.deleteSession(session._id);
    //         });
    //
    //     });
    // });

    describe('start a session', function () {
        let session;
        before(function (done) {
            session = sessionService.createSession('testSession', 'testing the creation of a session', 'blue',
                60000, {min: 3, max: 10}, [], false, false, [globalTestUser],
                globalTestTheme._id, globalTestUser);
            done();
        });
        it('Should start a session', function (done) {
            chai.request(server)
                .post('/session/' + session._id + '/start')
                .send()
                .end((err, res) => {
                    res.should.have.status(202);
                    done();
                });
        });
        after('clean up created stuff', function () {
            it('delete  session', function (done) {
                sessionService.deleteSession(session._id);
                done();
            });
        });
    });

    describe('stop a session', function () {
        let session;
        before(function (done) {
            session = sessionService.createSession('testSession', 'testing the creation of a session', 'blue',
                60000, {min: 3, max: 10}, [], false, false, [globalTestUser],
                globalTestTheme._id, globalTestUser);
            done();
        });
        it('cant stop a session if the session is not started yet', (done) => {
            chai.request(server)
                .post('/session/' + session._id + '/stop')
                .send()
                .end((err, res) => {
                    res.should.have.status(400);
                    done();
                });
        });
        it('should stop a session', (done) => {
            chai.request(server)
                .post('/session/' + session._id + '/start')
                .send()
                .end((err, res) => {
                    res.should.have.status(202);
                });
            chai.request(server)
                .post('/session/' + session._id + '/stop')
                .send()
                .end((err, res) => {
                    res.should.have.status(202);
                    done();
                });
        });
        after('clean up created stuff', function (done) {
            sessionService.deleteSession(session._id);
            done();
        });
    });

    after('remove testuser', function (done) {
        userService.removeUser(globalTestUser._id, function (succes, err) {
            assert.isNotOk(err);
            assert.isTrue(succes, 'user should have succesfully been deleted');
            done();
        });
    });

    after('remove testtheme', function (done) {
        themeService.removeTheme(globalTestTheme._id);
        done();
    });

    after('Closing connection to test database', function (done) {
        mongoose.disconnect();
        done();
    });
});