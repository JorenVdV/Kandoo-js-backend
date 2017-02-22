/**
 * Created by steve on 2/10/2017.
 */
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
        globalTestTheme = themeService.addTheme('testTheme', 'a theme to use in the test', 'test', 'false', globalTestUser, [], function (theme, err) {
            assert.isNotOk(err);
            assert.isOk(theme);
            globalTestTheme = theme;
            done();
        });
    });

    describe('/POST /theme/:themeId/session', function () {
        it('Create a session', function (done) {
            let session = {
                title: 'Welke pudding eten we deze week?',
                description: 'Test om sessie aan te maken',
                circleType: 'opportunity',
                turnDuration: 60000,
                minCardsPerParticipant: 2,
                maxCardsPerParticipant: 5,
                cards: [],
                cardsCanBeReviewed: false,
                cardsCanBeAdded: false,
                creator: globalTestUser,
                startDate: null,
                amountOfCircles: 5
            };
            chai.request(server)
                .post('/theme/' + globalTestTheme._id + '/session')
                .send(session)
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.have.property('session');
                    let resSession = res.body.session;
                    assert.isOk(resSession, 'the session should be defined');
                    assert.strictEqual(resSession.title, 'Welke pudding eten we deze week?');
                    assert.equal(resSession.creator, globalTestUser._id, 'creator should have the same id as globaltestuser');

                    sessionService.deleteSession(resSession._id, function (success, err) {
                        assert.isNotOk(err);
                        assert.isTrue(success);

                        done();
                    });
                });
        });

        it('Create a session - invalid circle type', function (done) {
            let session = {
                title: 'Welke pudding eten we deze week?',
                description: 'Test om sessie aan te maken',
                circleType: 'blue',
                turnDuration: 60000,
                minCardsPerParticipant: 2,
                maxCardsPerParticipant: 5,
                cards: [],
                cardsCanBeReviewed: false,
                cardsCanBeAdded: false,
                creator: globalTestUser,
                startDate: null,
                amountOfCircles: 5
            };
            chai.request(server)
                .post('/theme/' + globalTestTheme._id + '/session')
                .send(session)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.have.property('error');
                    assert.isOk(res.body.error);
                    assert.strictEqual(res.body.error, 'Invalid circle type. Circle type should be "opportunity" or "threat".');
                    done();
                });
        });
    });

    describe('/DELETE /session/:sessionId/delete', function () {
        let GETSession_session;
        before('Create a session', function (done) {
            let callback = function (session, err) {
                assert.isNotOk(err);
                assert.isOk(session);

                GETSession_session = session;
                done();
            };
            sessionService.createSession('Welke pudding eten we deze week?', 'Test om sessie aan te maken', 'opportunity',
                2, 5, [],
                true, false, [globalTestUser], globalTestTheme, globalTestUser, new Date(), null, null, callback);
        });

        it('Delete the session', function (done) {
            chai.request(server)
                .delete('/session/' + GETSession_session._id + '/delete')
                .end((err, res) => {
                    res.should.have.status(204);
                    done();
                });
        });

        it('Delete a non existing session', function (done) {
            chai.request(server)
                .delete('/session/' + '00aa0aa000a000000a0000aa' + '/delete')
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.should.have.property('error');

                    assert.strictEqual(res.body.error, 'Unable to find session with id ' + '00aa0aa000a000000a0000aa');
                    done();
                });
        });

    });

    describe('/GET  /session/:sessionId', function () {
        let GETSession_session;
        before('Create a session', function (done) {
            sessionService.createSession('Welke pudding eten we deze week?', 'Test om sessie aan te maken', 'opportunity', 3, 5, [],
                true, false, [globalTestUser], globalTestTheme, globalTestUser, new Date(), null, null,
                (session, err) => {
                    assert.isNotOk(err);
                    assert.isOk(session);

                    GETSession_session = session;
                    done();
                });
        });

        it('retrieve an existing session', function (done) {
            chai.request(server)
                .get('/session/' + GETSession_session._id)
                .send()
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.property('session');
                    let resSession = res.body.session;
                    assert.isOk(resSession, 'the session should be defined');
                    assert.strictEqual(resSession.title, GETSession_session.title);
                    assert.equal(resSession.creator, globalTestUser._id);
                    assert.equal(resSession._id, GETSession_session._id);
                    done();
                });
        });

        it('retrieve a non existing session', function (done) {
            chai.request(server)
                .get('/session/' + '00aa0aa000a000000a0000aa')
                .send()
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.should.have.property('error');
                    assert.strictEqual(res.body.error, 'Unable to find session with id ' + '00aa0aa000a000000a0000aa');
                    done();
                });
        });

        after('Remove the session', function (done) {
            sessionService.deleteSession(GETSession_session._id, function (success, err) {
                assert.isNotOk(err);
                assert.isTrue(success);

                done();
            });
        });
    });

    describe('/GET /theme/:themeId/sessions', function () {
        it('get all sessions - no existing sessions', function (done) {
            chai.request(server)
                .get('/theme/' + globalTestTheme._id + '/sessions')
                .send()
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.property('sessions');
                    let resSessions = res.body.sessions;
                    assert.isArray(resSessions);
                    assert.strictEqual(resSessions.length, 0);
                    done();
                });
        });

        describe('get all sessions - one existing session', function () {
            let GETSessions_session;
            before('create a session', function (done) {
                sessionService.createSession('Welke pudding eten we deze week?', 'Test om sessie aan te maken', 'opportunity', 3, 5, [],
                    true, false, [globalTestUser], globalTestTheme, globalTestUser, new Date(), null, null,
                    (session, err) => {
                        assert.isNotOk(err);
                        assert.isOk(session);

                        GETSessions_session = session;
                        done();
                    });
            });

            it('retrieve all sessions', function (done) {
                chai.request(server)
                    .get('/theme/' + globalTestTheme._id + '/sessions')
                    .send()
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.have.property('sessions');
                        let resSessions = res.body.sessions;
                        assert.isArray(resSessions);
                        assert.strictEqual(resSessions.length, 1);
                        assert.equal(resSessions[0]._id, GETSessions_session._id);
                        assert.equal(resSessions[0].creator, globalTestUser._id);
                        done();
                    });
            });

            after('Remove the session', function (done) {
                sessionService.deleteSession(GETSessions_session._id, function (success, err) {
                    assert.isNotOk(err);
                    assert.isTrue(success);

                    done();
                });
            });
        });

        describe('get all sessions - two existing sessions', function () {
            let GETSessions_session1;
            let GETSessions_session2;
            before('create a session', function (done) {
                sessionService.createSession('Welke pudding eten we deze week?', 'Test om sessie aan te maken', 'opportunity', 3, 5, [],
                    true, false, [globalTestUser], globalTestTheme, globalTestUser, new Date(), null, null,
                    (session, err) => {
                        assert.isNotOk(err);
                        assert.isOk(session);

                        GETSessions_session1 = session;
                        done();
                    });
            });

            before('create a second session', function (done) {
                sessionService.createSession('Welke pudding eten we volgende week?', 'Test om sessie aan te maken', 'opportunity', 3, 5, [],
                    true, false, [globalTestUser], globalTestTheme, globalTestUser, new Date(), null, null,
                    (session, err) => {
                        assert.isNotOk(err);
                        assert.isOk(session);

                        GETSessions_session2 = session;
                        done();
                    });
            });

            it('retrieve all sessions', function (done) {
                chai.request(server)
                    .get('/theme/' + globalTestTheme._id + '/sessions')
                    .send()
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.have.property('sessions');
                        let resSessionsIds = res.body.sessions.map(session => session._id);
                        console.log(resSessionsIds.map(session => session._id));
                        assert.isTrue(resSessionsIds.includes(GETSessions_session1._id.toString()));
                        assert.isTrue(resSessionsIds.includes(GETSessions_session2._id.toString()));
                        // assert.equal(resSessions[0]._id, GETSessions_session1._id);
                        // assert.equal(resSessions[0].creator, globalTestUser._id);
                        // assert.strictEqual(resSessions[0].title, 'Welke pudding eten we deze week?');
                        //
                        // assert.equal(resSessions[1]._id, GETSessions_session2._id);
                        // assert.equal(resSessions[1].creator, globalTestUser._id);
                        // assert.strictEqual(resSessions[1].title, 'Welke pudding eten we volgende week?');
                        done();
                    });
            });

            after('Remove the first session', function (done) {
                sessionService.deleteSession(GETSessions_session1._id, function (success, err) {
                    assert.isNotOk(err);
                    assert.isTrue(success);

                    done();
                });
            });

            after('Remove the second session', function (done) {
                sessionService.deleteSession(GETSessions_session2._id, function (success, err) {
                    assert.isNotOk(err);
                    assert.isTrue(success);

                    done();
                });
            });
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

    //TODO fix start a session  & turn
    console.error('#####################################');
    console.error('# TODO: fix start a session  & turn #');
    console.error('#####################################');
    // describe('start a session', function () {
    //     let session;
    //     before(function (done) {
    //         session = sessionService.createSession('testSession', 'testing the creation of a session', 'blue',
    //             60000, {min: 3, max: 10}, [], false, false, [globalTestUser],
    //             globalTestTheme._id, globalTestUser);
    //         done();
    //     });
    //     it('Should start a session', function (done) {
    //         chai.request(server)
    //             .post('/session/' + session._id + '/start')
    //             .send()
    //             .end((err, res) => {
    //                 res.should.have.status(202);
    //                 done();
    //             });
    //     });
    //     after('clean up created stuff', function () {
    //         it('delete  session', function (done) {
    //             sessionService.deleteSession(session._id);
    //             done();
    //         });
    //     });
    // });
    //
    // describe('stop a session', function () {
    //     let session;
    //     before(function (done) {
    //         session = sessionService.createSession('testSession', 'testing the creation of a session', 'blue',
    //             60000, {min: 3, max: 10}, [], false, false, [globalTestUser],
    //             globalTestTheme._id, globalTestUser);
    //         done();
    //     });
    //     it('cant stop a session if the session is not started yet', (done) => {
    //         chai.request(server)
    //             .post('/session/' + session._id + '/stop')
    //             .send()
    //             .end((err, res) => {
    //                 res.should.have.status(400);
    //                 done();
    //             });
    //     });
    //     it('should stop a session', (done) => {
    //         chai.request(server)
    //             .post('/session/' + session._id + '/start')
    //             .send()
    //             .end((err, res) => {
    //                 res.should.have.status(202);
    //             });
    //         chai.request(server)
    //             .post('/session/' + session._id + '/stop')
    //             .send()
    //             .end((err, res) => {
    //                 res.should.have.status(202);
    //                 done();
    //             });
    //     });
    //     after('clean up created stuff', function (done) {
    //         sessionService.deleteSession(session._id);
    //         done();
    //     });
    // });
    // describe('/POST /session/:sessionId/turn', function () {
    //     let sessionId;
    //     let card;
    //     before('should create a session to use and add a card to the theme', function (done) {
    //         this.sessionId = 0;
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
    //         card = {description: 'This is a test description'};
    //         card = cardService.addCard(card.description);
    //         themeService.addCard(globalTestTheme._id, card, function (theme, err) {
    //
    //         });
    //
    //     });
    //     it('should add a turn to the session', function (done) {
    //         chai.request(server)
    //             .post('/session/' + this.sessionId + '/turn')
    //             .send({userId: globalTestUser._id, cardId: card._id})
    //             .end((err, res) => {
    //                 res.should.have.status(201);
    //                 done();
    //             });
    //     });
    //     after('clean up created stuff', function () {
    //         sessionService.deleteSession(sessionId);
    //     });
    // });

    after('remove testuser', function (done) {
        userService.removeUser(globalTestUser._id, function (success, err) {
            assert.isNotOk(err);
            assert.isTrue(success, 'user should have succesfully been deleted');
            done();
        });
    });

    after('remove testtheme', function (done) {
        themeService.removeTheme(globalTestTheme._id, function (success, err) {
            assert.isNotOk(err);
            assert.isTrue(success);
            done();
        });
    });

});