/**
 * Created by steve on 2/10/2017.
 */
var chai = require('chai');
var chaiHttp = require('chai-http');
var assert = chai.assert;
var should = chai.should();
var server = require('../app');
var themeService = require('../services/theme-service');
var userService = require('../services/user-service');
var cardService = require('../services/card-service');
var sessionService = require('../services/session-service');

chai.use(chaiHttp);

describe('Session Controller tests', function () {
    let globalTestTheme;
    let globalTestUser;
    before('create a theme to create sessions on', function () {
        globalTestUser = userService.createUser('test', 'user', 'test.user@teamjs.xyz', 'TeamJS', 'test');
        globalTestTheme = themeService.addTheme('testTheme', 'a theme to use in the test', 'test', 'false', globalTestUser, []);

    });
    describe('/POST /theme/:themeId/session', function () {
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
    describe('/GET  /theme/:themeId/sessions', function () {
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
            chai.request(server)
                .delete('/session/' + this.sessionId + '/delete')
                .end((err, res) => {
                    res.should.have.status(204);
                    done();
                });
        });
    });
    describe('/GET  /theme/:themeId/sessions', function () {
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
                chai.request(server)
                    .delete('/session/' + this.sessionIds[0] + '/delete')
                    .end((err, res) => {
                        res.should.have.status(204);
                        done();
                    });
            });
            it('delete the second session', function (done) {
                chai.request(server)
                    .delete('/session/' + this.sessionIds[1] + '/delete')
                    .end((err, res) => {
                        res.should.have.status(204);
                        done();
                    });
            });

        });
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
                .send({userId: globalTestUser._id, sessionId: sessionId, cardId: card._id})
                .end((err, res) => {
                    res.should.have.status(201);
                    done();
                });
        });
        after('clean up created stuff', function () {
            it('delete the first session', function (done) {
                chai.request(server)
                    .delete('/session/' + this.sessionId + '/delete')
                    .end((err, res) => {
                        res.should.have.status(204);
                        done();
                    });
            });

        });
    });
    describe('/POST /session/:sessionId/invite', function () {
        let session;
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
                    this.sessionId = resSession._id;
                    done();
                });


        });
        it('should add a user to the list of invitees', function (done) {
            chai.request(server)

                .post('/session/' + this.sessionId + '/invite')
                .send({userId: globalTestUser._id})
                .end((err, res) => {
                    res.should.have.status(201);
                });



            chai.request(server)
                .get('/session/' + this.sessionId)
                .send()
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.property('session');
                    let resSession1 = res.body.session;
                    assert.equal(globalTestUser._id, resSession1.invitees[0], 'the Id\'s should match');
                    done();
                });



        });
        after('clean up created stuff', function () {
            it('delete  session', function (done) {
                sessionService.deleteSession(session._id);
            });

        });
    });
    after('remove testtheme and testuser', function () {
        userService.removeUser(globalTestUser._id);
        themeService.removeTheme(globalTestTheme._id);
    });
});