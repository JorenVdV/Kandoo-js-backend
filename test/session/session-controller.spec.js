/**
 * Created by steve on 2/10/2017.
 */
process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const assert = chai.assert;
const should = chai.should();
const server = require('../../app-test');
const themeService = require('../../services/theme-service');
const userService = require('../../services/user-service');
const sessionService = require('../../services/session-service');

chai.use(chaiHttp);


describe('Session Controller tests', function () {
    let globalTestTheme;
    let globalTestUser;
    before('create a testUser & test theme', async function () {
        globalTestUser = await userService.addUser('test', 'user', 'test.user@teamjs.xyz', 'TeamJS', 'test');
        assert.isOk(globalTestUser);
        globalTestTheme = await themeService.addTheme('testTheme', 'a theme to use in the test', 'test', 'false', globalTestUser, []);
        assert.isOk(globalTestTheme);
    });

    describe('/POST /theme/:themeId/session', function () {
        let created_session;
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
                    created_session = resSession;
                    done();
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

        after('Remove the session', async() => {
            let successful = await sessionService.removeSession(created_session._id);
            assert.isTrue(successful);
        })
    });

    describe('/DELETE /session/:sessionId/delete', function () {
        let GETSession_session;
        before('Create a session', async function () {
            GETSession_session = await sessionService.addSession('Welke pudding eten we deze week?', 'Test om sessie aan te maken', 'opportunity',
                2, 5, [],
                true, false, [globalTestUser], globalTestTheme, globalTestUser, new Date(), null, null);
            assert.isOk(GETSession_session);
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

                    assert.strictEqual(res.body.error, 'Unable to find session with id: ' + '00aa0aa000a000000a0000aa');
                    done();
                });
        });

    });

    describe('/GET  /session/:sessionId', function () {
        let GETSession_session;
        before('Create a session', async function () {
            GETSession_session = await sessionService.addSession('Welke pudding eten we deze week?', 'Test om sessie aan te maken', 'opportunity',
                2, 5, [],
                true, false, [globalTestUser], globalTestTheme, globalTestUser, new Date(), null, null);
            assert.isOk(GETSession_session);
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
                    assert.strictEqual(res.body.error, 'Unable to find session with id: ' + '00aa0aa000a000000a0000aa');
                    done();
                });
        });

        after('Remove the session', async function () {
            let successful = await sessionService.removeSession(GETSession_session._id);
            assert.isTrue(successful);

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
            before('Create a session', async function () {
                GETSessions_session = await sessionService.addSession('Welke pudding eten we deze week?', 'Test om sessie aan te maken', 'opportunity',
                    2, 5, [],
                    true, false, [globalTestUser], globalTestTheme, globalTestUser, new Date(), null, null);
                assert.isOk(GETSessions_session);
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

            after('Remove the session', async function () {
                let successful = await sessionService.removeSession(GETSessions_session._id);
                assert.isTrue(successful);
            });
        });

        describe('get all sessions - two existing sessions', function () {
            let GETSessions_session1;
            let user2;
            let GETSessions_session2;
            before('Create the sessions & second testuser', async function () {
                GETSessions_session1 = await sessionService.addSession('Welke pudding eten we deze week?', 'Test om sessie aan te maken', 'opportunity',
                    2, 5, [],
                    true, false, [globalTestUser], globalTestTheme, globalTestUser, new Date(), null, null);
                assert.isOk(GETSessions_session1);

                user2 = await userService.addUser('test', 'user1', 'test.user1@teamjs.xyz', 'TeamJS', 'test');
                assert.isOk(user2);

                GETSessions_session2 = await sessionService.addSession('Welke pudding eten we volgende week?', 'Test om sessie aan te maken', 'opportunity',
                    2, 5, [],
                    true, false, [user2], globalTestTheme, user2, new Date(), null, null);
                assert.isOk(GETSessions_session2);
            });

            it('retrieve all sessions', function (done) {
                chai.request(server)
                    .get('/theme/' + globalTestTheme._id + '/sessions')
                    .send()
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.have.property('sessions');
                        let resSessionsIds = res.body.sessions.map(session => session._id);

                        assert.isTrue(resSessionsIds.includes(GETSessions_session1._id.toString()));
                        assert.isTrue(resSessionsIds.includes(GETSessions_session2._id.toString()));
                        done();
                    });
            });

            it('retrieve all sessions - by participant globalTestUser', function (done) {
                chai.request(server)
                    .get('/' + globalTestUser._id + '/sessions/participating')
                    .send()
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.have.property('sessions');
                        let resSessionsIds = res.body.sessions.map(session => session._id);
                        assert.isTrue(resSessionsIds.includes(GETSessions_session1._id.toString()));
                        done();
                    });
            });

            it('retrieve all sessions - by participant user2', function (done) {
                chai.request(server)
                    .get('/' + user2._id + '/sessions/participating')
                    .send()
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.have.property('sessions');
                        let resSessionsIds = res.body.sessions.map(session => session._id);
                        assert.isTrue(resSessionsIds.includes(GETSessions_session2._id.toString()));
                        done();
                    });
            });

            after('Remove the sessions & testuser', async function () {
                let successful = await sessionService.removeSession(GETSessions_session1._id);
                assert.isTrue(successful);

                successful = await sessionService.removeSession(GETSessions_session2._id);
                assert.isTrue(successful);

                successful = await userService.removeUser(user2._id);
                assert.isTrue(successful);
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
    //             sessionService.removeSession(session._id);
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
    //         session = sessionService.addSession('testSession', 'testing the creation of a session', 'blue',
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
    //             sessionService.removeSession(session._id);
    //             done();
    //         });
    //     });
    // });
    //
    // describe('stop a session', function () {
    //     let session;
    //     before(function (done) {
    //         session = sessionService.addSession('testSession', 'testing the creation of a session', 'blue',
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
    //         sessionService.removeSession(session._id);
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
    //         sessionService.removeSession(sessionId);
    //     });
    // });

    after('remove testuser & test theme', async function () {
        let successful = await userService.removeUser(globalTestUser._id);
        assert.isTrue(successful);

        successful = await themeService.removeTheme(globalTestTheme._id);
        assert.isTrue(successful);
    });

});