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

chai.use(chaiHttp);

describe('Session Controller tests', function () {
    let globalTestTheme;
    let globalTestUser;
    before('create a theme to create sessions on', function () {
        globalTestUser = userService.createUser('test', 'user', 'test.user@teamjs.xyz', 'TeamJS', 'test');
        globalTestTheme = themeService.addTheme('testTheme', 'a theme to use in the test', 'test', 'false', globalTestUser, []);

    });
    describe('POST /theme/:themeId/session', function () {
        it('should create a session', function (done) {
            let session = {
                title: 'Welke pudding eten we deze week?',
                description: 'Test om sessie aan te maken',
                circleType: 'Pudding Incorporated',
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
                    console.log(res.body.session);
                    done();
                });
        });
    });

    describe('GET /session/:sessionId', function () {
        let sessionId;
        before('should create a session to use', function (done) {
            let session = {
                title: 'Welke pudding eten we deze week?',
                description: 'Test om sessie aan te maken',
                circleType: 'Pudding Incorporated',
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
                    console.log(this.sessionId);
                    done();
                });
        });
        it('should get a session', function (done) {
            console.log(this.sessionId);
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
    });
    after('remove testtheme and testuser', function () {
        userService.removeUser(globalTestUser._id);
        themeService.removeTheme(globalTestTheme._id);
    });
});