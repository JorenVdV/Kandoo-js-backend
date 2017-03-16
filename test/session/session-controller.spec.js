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
const cardService = require('../../services/card-service');

require('../global');
chai.use(chaiHttp);

describe('Session Controller tests', function () {
    let globalTestTheme;
    let globalTestUser;
    let globalTestUser_token;


    before('create a testUser & test theme', async function () {
        globalTestUser = await userService.addUser('test', 'user', 'test.user@teamjs.xyz', 'TeamJS', 'test');
        assert.isOk(globalTestUser);
        globalTestTheme = await themeService.addTheme('testTheme', 'a theme to use in the test', 'test', 'false', globalTestUser, []);
        assert.isOk(globalTestTheme);
        globalTestUser_token = 'bla';
    });

    // before('Login the testUser', (done) => {
    //     chai.request(server)
    //         .post('/login')
    //         .send({emailAddress: 'test.user@teamjs.xyz', password: "test"})
    //         .end((err,res) => {
    //             res.should.have.status(200);
    //             res.body.should.have.property('token');
    //             res.body.should.have.property('userId');
    //             assert.strictEqual(res.body.userId.toString(), globalTestUser._id.toString());
    //             globalTestUser_token = res.body.token;
    //             done();
    //         })
    // });

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
            console.log('/POST /theme/:themeId/session');
            chai.request(server)
                .post('/theme/' + globalTestTheme._id + '/session')
                .set('X-Access-Token', globalTestUser_token)
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
                .set('X-Access-Token', globalTestUser_token)
                .send(session)
                .end((err, res) => {
                    res.should.have.status(404);
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
                .set('X-Access-Token', globalTestUser_token)
                .end((err, res) => {
                    res.should.have.status(204);
                    done();
                });
        });

        it('Delete a non existing session', function (done) {
            chai.request(server)
                .delete('/session/' + '00aa0aa000a000000a0000aa' + '/delete')
                .set('X-Access-Token', globalTestUser_token)
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
            console.log('Retrieve an existing session');
            chai.request(server)
                .get('/session/' + GETSession_session._id)
                .set('X-Access-Token', globalTestUser_token)
                .send()
                .end((err, res) => {
                console.log(res.error.text);
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
                .set('X-Access-Token', globalTestUser_token)
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
                .set('X-Access-Token', globalTestUser_token)
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
                    .set('X-Access-Token', globalTestUser_token)
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
                    .set('X-Access-Token', globalTestUser_token)
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
                    .get('/user/' + globalTestUser._id + '/sessions/participating')
                    .set('X-Access-Token', globalTestUser_token)
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
                    .get('/user/' + user2._id + '/sessions/participating')
                    .set('X-Access-Token', globalTestUser_token)
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

    describe('/PUT /session/:sessionId/invite', function () {
        let session;
        let anotherUser;
        before('Create a session', async() => {
            session = await sessionService.addSession('Test session', 'test session creation', 'opportunity', 3, 5, [],
                true, false, [globalTestUser], globalTestTheme, globalTestUser, null, null, null);
            assert.isOk(session);

            anotherUser = await userService.addUser('blem', 'Kalob', 'blemkalob@iets.be', null, 'blemkalbo');
            assert.isOk(anotherUser);
        });

        it('Invite a user to a session - invitees check', (done) => {
            let invitees = session.invitees;
            invitees.push(anotherUser.emailAddress);
            chai.request(server)
                .put('/session/' + session._id + '/invitees')
                .set('X-Access-Token', globalTestUser_token)
                .send({invitees: invitees})
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.property('invitees');
                    let sessionInvitees = res.body.invitees;
                    assert.isOk(sessionInvitees);
                    assert.isTrue(sessionInvitees.length > 0);
                    assert.isTrue(sessionInvitees.includes(anotherUser.emailAddress));
                    session.invitees = sessionInvitees;
                    done();
                });
        });

        it('Invite a user to a session - unable to invite an already participating person', (done) => {
            let invitees = session.invitees;
            invitees.push(globalTestUser.emailAddress);
            chai.request(server)
                .put('/session/' + session._id + '/invitees')
                .set('X-Access-Token', globalTestUser_token)
                .send({invitees: invitees})
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.have.property('error');
                    assert.strictEqual(res.body.error, globalTestUser.emailAddress + ' is already a participant of this session');
                    done();
                });
        });

        it('Update various fields of a session', (done) => {
            let updates = {
                title: 'Test session title update',
                description: 'a fun description',
                maxCardsPerParticipant: 10
            };
            chai.request(server)
                .put('/session/' + session._id + '/update')
                .set('X-Access-Token', globalTestUser_token)
                .send(updates)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.property('session');
                    let newSession = res.body.session;
                    assert.strictEqual(newSession.title, 'Test session title update');
                    assert.strictEqual(newSession.description, 'a fun description');
                    assert.strictEqual(newSession.maxCardsPerParticipant, 10);
                    assert.strictEqual(newSession.circleType, session.circleType);
                    assert.strictEqual(newSession.minCardsPerParticipant, session.minCardsPerParticipant);
                    assert.strictEqual(newSession.cardsCanBeAdded, session.cardsCanBeAdded);
                    assert.strictEqual(newSession.cardsCanBeReviewed, session.cardsCanBeReviewed);
                    session = newSession;
                    done();
                });
        });

        it('Update all updateable fields of a session', (done) => {
            let updates = {
                title: 'test123',
                description: '456tset',
                circleType: 'threat',
                minCardsPerParticipant: 1,
                maxCardsPerParticipant: 20,
                amountOfCircles: 10,
                sessionCards: [],
                cardsCanBeReviewed: false,
                cardsCanBeAdded: true,
                turnDuration: 20000
            };
            chai.request(server)
                .put('/session/' + session._id + '/update')
                .set('X-Access-Token', globalTestUser_token)
                .send(updates)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.property('session');
                    let newSession = res.body.session;
                    assert.strictEqual(newSession.title, 'test123');
                    assert.strictEqual(newSession.description, '456tset');
                    assert.strictEqual(newSession.circleType, 'threat');
                    assert.strictEqual(newSession.minCardsPerParticipant, 1);
                    assert.strictEqual(newSession.maxCardsPerParticipant, 20);
                    assert.strictEqual(newSession.amountOfCircles, 10);
                    assert.strictEqual(newSession.sessionCards.length, 0);
                    assert.strictEqual(newSession.cardsCanBeReviewed, false);
                    assert.strictEqual(newSession.cardsCanBeAdded, true);
                    assert.strictEqual(newSession.turnDuration, 20000);
                    session = newSession;
                    done();
                });
        });

        after('Remove the session & user', async() => {
            let successful = await sessionService.removeSession(session._id);
            assert.isTrue(successful);
            successful = await userService.removeUser(anotherUser._id);
            assert.isTrue(successful);
        });
    });

    describe('/PUT /session/:sessionId/accept', function () {
        let session;
        let anotherUser;
        before('Create a session & invite anotherUser to the session', async() => {
            session = await sessionService.addSession('Test session', 'test session creation', 'opportunity', 3, 5, [],
                true, false, [globalTestUser], globalTestTheme, globalTestUser, null, null, null);
            assert.isOk(session);

            anotherUser = await userService.addUser('blem', 'Kalob', 'blemkalob@iets.be', null, 'blemkalbo');
            assert.isOk(anotherUser);

            let invitees = session.invitees;
            invitees.push(anotherUser.emailAddress);
            session = await sessionService.updateInvitees(session._id, invitees);
            assert.isOk(session);
        });

        it('Accept the invite to the session', (done) => {
            console.log(' add tests for failures - accepting invite');
            chai.request(server)
                .put('/session/' + session._id + '/accept')
                .set('X-Access-Token', globalTestUser_token)
                .send({userId: anotherUser._id})
                .end((err, res) => {
                    res.should.have.status(204);
                    done();
                });
        });

        after('Remove the session & user', async() => {
            let successful = await sessionService.removeSession(session._id);
            assert.isTrue(successful);
            successful = await userService.removeUser(anotherUser._id);
            assert.isTrue(successful);
        });
    });

    describe('/PUT /session/:sessionId/start', function () {
        let testSession;
        before('Create the session', async() => {
            testSession = await sessionService.addSession('Test session', 'test session creation', 'opportunity', 3, 5, [],
                true, false, [globalTestUser], globalTestTheme, globalTestUser, null, null, null);
            assert.isOk(testSession);
        });

        it('Start the session', (done) => {
            chai.request(server)
                .put('/session/' + testSession._id + '/start')
                .set('X-Access-Token', globalTestUser_token)
                .send({userId: globalTestUser._id})
                .end((err, res) => {
                    res.should.have.status(204);
                    done();
                })
        });

        after('Check the session has started', async() => {
            let session = await sessionService.getSession(testSession._id);
            assert.isOk(session);
            assert.strictEqual(session.status, 'started');
        });

        after('Remove the session', async() => {
            let successful = await sessionService.removeSession(testSession._id);
            assert.isTrue(successful);
        });
    });

    describe('/PUT /session/:sessionId/pause', function () {
        let testSession;
        before('Create the session', async() => {
            testSession = await sessionService.addSession('Test session', 'test session creation', 'opportunity', 3, 5, [],
                true, false, [globalTestUser], globalTestTheme, globalTestUser, null, null, null);
            assert.isOk(testSession);
        });

        before('Start the session', async() => {
            testSession = await sessionService.startSession(testSession._id, globalTestUser._id);
            assert.isOk(testSession);
        });

        it('pause the session', (done) => {
            chai.request(server)
                .put('/session/' + testSession._id + '/pause')
                .set('X-Access-Token', globalTestUser_token)
                .send({userId: globalTestUser._id})
                .end((err, res) => {
                    res.should.have.status(204);
                    done();
                })
        });

        after('Check the session has paused', async() => {
            let session = await sessionService.getSession(testSession._id);
            assert.isOk(session);
            assert.strictEqual(session.status, 'paused');
        });

        after('Remove the session', async() => {
            let successful = await sessionService.removeSession(testSession._id);
            assert.isTrue(successful);
        });
    });

    describe('/PUT /session/:sessionId/stop', function () {
        let testSession;
        before('Create the session', async() => {
            testSession = await sessionService.addSession('Test session', 'test session creation', 'opportunity', 3, 5, [],
                true, false, [globalTestUser], globalTestTheme, globalTestUser, null, null, null);
            assert.isOk(testSession);
        });

        before('Start the session', async() => {
            testSession = await sessionService.startSession(testSession._id, globalTestUser._id);
            assert.isOk(testSession);
        });

        it('Stop the session', (done) => {
            chai.request(server)
                .put('/session/' + testSession._id + '/stop')
                .set('X-Access-Token', globalTestUser_token)
                .send({userId: globalTestUser._id})
                .end((err, res) => {
                    res.should.have.status(204);
                    done();
                })
        });

        after('Check the session has finished', async() => {
            let session = await sessionService.getSession(testSession._id);
            assert.isOk(session);
            assert.strictEqual(session.status, 'finished');
        });

        after('Remove the session', async() => {
            let successful = await sessionService.removeSession(testSession._id);
            assert.isTrue(successful);
        });
    });

    describe('/PUT /session/:sessionId/pick', function () {
        let session;
        let cards = [];
        before('Create the session', async function () {
            this.timeout(15000);
            session = await sessionService.addSession('Test session', 'test session creation', 'opportunity', 3, 5, [],
                true, false, [globalTestUser], globalTestTheme, globalTestUser, null, null, null);
            assert.isOk(session);

            cards.push(await cardService.addCard("first card", globalTestTheme._id));
            cards.push(await cardService.addCard("second card", globalTestTheme._id));
            cards.push(await cardService.addCard("third card", globalTestTheme._id));
            cards.push(await cardService.addCard("fourth card", globalTestTheme._id));
            cards.push(await cardService.addCard("fifth card", globalTestTheme._id));
            cards.push(await cardService.addCard("sixth card", globalTestTheme._id));

            let toUpdate = {
                sessionCards: session.sessionCards
            };

            cards.forEach(function (card) {
                toUpdate.sessionCards.push(card);
            });

            session = await sessionService.changeSession(session._id, toUpdate);
            assert.isOk(session);
            assert.strictEqual(session.sessionCards.length, 6);
        });

        it('Pick cards of the session', (done) => {
            chai.request(server)
                .put('/session/' + session._id + '/start')
                .set('X-Access-Token', globalTestUser_token)
                .send({userId: globalTestUser._id})
                .end((err, res) => {
                    res.should.have.status(204);
                    done();
                })
        });


        after('Remove the session', async() => {
            let successful = await sessionService.removeSession(session._id);
            assert.isTrue(successful);
            cards.forEach(async function (card) {
                let successful = await cardService.removeCard(card._id);
                assert.isTrue(successful);
            });
        });
    });

    describe('/PUT /session/:sessionId/turn', function () {
        let session;
        let cards = [];
        let anotherUser;

        before('Create anotherUser and session of which both anotherUser and testUser are a participant', async() => {
            anotherUser = await userService.addUser('blem', 'Kalob', 'blemkalob@iets.be', null, 'blemkalbo');
            assert.isOk(anotherUser);

            session = await sessionService.addSession('Test session', 'test session creation', 'opportunity', 3, 5, [],
                true, false, [globalTestUser, anotherUser], globalTestTheme, globalTestUser, null, null, null);
            assert.isOk(session);
        });

        before('Add cards to the session', async function () {
            this.timeout(10000);
            cards.push(await cardService.addCard("first card", globalTestTheme._id));
            cards.push(await cardService.addCard("second card", globalTestTheme._id));
            cards.push(await cardService.addCard("third card", globalTestTheme._id));
            cards.push(await cardService.addCard("fourth card", globalTestTheme._id));
            cards.push(await cardService.addCard("fifth card", globalTestTheme._id));
            cards.push(await cardService.addCard("sixth card", globalTestTheme._id));

            let toUpdate = {
                sessionCards: session.sessionCards
            };

            cards.forEach(function (card) {
                toUpdate.sessionCards.push(card);
            });

            session = await sessionService.changeSession(session._id, toUpdate);
            assert.isOk(session);
            assert.strictEqual(session.sessionCards.length, 6);
        });

        before('Pick cards for the session - globalTestUser', async() => {
            let userCards = cards.slice(0, 4);
            let pickedCards = await sessionService.pickCards(session._id, globalTestUser._id, userCards);
            assert.isOk(pickedCards);
            assert.isArray(pickedCards.cards);

            let userCardsAsStrings = userCards.map(card => card._id.toString());
            let pickedCardsAsStrings = pickedCards.cards.map(pickedCard => pickedCard.toString());
            assert.strictEqual(userCardsAsStrings.length, pickedCardsAsStrings.length);
            assert.strictEqual(pickedCards.cards.length, 4);
            assert.isTrue(pickedCardsAsStrings.includes(userCardsAsStrings[0]));
            assert.isTrue(pickedCardsAsStrings.includes(userCardsAsStrings[1]));
            assert.isTrue(pickedCardsAsStrings.includes(userCardsAsStrings[2]));
            assert.isTrue(pickedCardsAsStrings.includes(userCardsAsStrings[3]));
        });

        before('Pick cards for the session - anotherUser', async() => {
            let userCards = cards.slice(2);
            let pickedCards = await sessionService.pickCards(session._id, anotherUser._id, userCards);
            assert.isOk(pickedCards);
            assert.isArray(pickedCards.cards);
            let userCardsAsStrings = userCards.map(card => card._id.toString());

            let pickedCardsAsStrings = pickedCards.cards.map(pickedCard => pickedCard.toString());

            assert.strictEqual(userCardsAsStrings.length, pickedCardsAsStrings.length);
            assert.strictEqual(pickedCards.cards.length, 4);
            assert.isTrue(pickedCardsAsStrings.includes(userCardsAsStrings[0]));
            assert.isTrue(pickedCardsAsStrings.includes(userCardsAsStrings[1]));
            assert.isTrue(pickedCardsAsStrings.includes(userCardsAsStrings[2]));
            assert.isTrue(pickedCardsAsStrings.includes(userCardsAsStrings[3]));
        });

        before('Start the session', async() => {
            let newSession = await sessionService.startSession(session._id, globalTestUser._id);
            assert.isOk(newSession);
            assert.strictEqual(newSession.status, 'started');
            assert.strictEqual(newSession.cardPriorities.length, 6);

            let cardPrioritiesAsStrings = newSession.cardPriorities.map(cardPriority => cardPriority.card._id.toString());
            let cardsAsStrings = cards.map(card => card._id.toString());

            assert.isTrue(cardPrioritiesAsStrings.includes(cardsAsStrings[0]));
            assert.isTrue(cardPrioritiesAsStrings.includes(cardsAsStrings[1]));
            assert.isTrue(cardPrioritiesAsStrings.includes(cardsAsStrings[2]));
            assert.isTrue(cardPrioritiesAsStrings.includes(cardsAsStrings[3]));
            assert.isTrue(cardPrioritiesAsStrings.includes(cardsAsStrings[4]));
            assert.isTrue(cardPrioritiesAsStrings.includes(cardsAsStrings[5]));

            let priorities = newSession.cardPriorities.map(cardPriority => cardPriority.priority);
            let sum = priorities.reduce(function (accumulated, currValue) {
                return accumulated + currValue;
            }, 0);
            assert.strictEqual(sum, 0);

            session = newSession;
        });

        it('Play a turn', (done) => {
            let card = cards[3];
            chai.request(server)
                .put('/session/' + session._id + '/turn')
                .set('X-Access-Token', globalTestUser_token)
                .send({userId: globalTestUser._id, cardId: card._id})
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.property('currentUser');
                    assert.strictEqual(res.body.currentUser.firstname + ' ' + res.body.currentUser.lastname, anotherUser.firstname + ' ' + anotherUser.lastname);
                    res.body.should.have.property('cardPriorities');
                    assert.isArray(res.body.cardPriorities);
                    let cardPriorities = res.body.cardPriorities;
                    let sum = cardPriorities.map(cardPriority => cardPriority.priority).reduce(function (accumulated, currValue) {
                        return accumulated + currValue;
                    }, 0);
                    assert.strictEqual(sum, 1);
                    done();
                });
        });

        after('Remove the created objects', async() => {
            let successful = await sessionService.removeSession(session._id);
            assert.isTrue(successful);
            successful = await userService.removeUser(anotherUser._id);
            assert.isTrue(successful);
            cards.forEach(async function (card) {
                let successful = await cardService.removeCard(card._id);
                assert.isTrue(successful);
            });
        });
    });

    describe('/GET /user/:userId/sessions/invited', () => {
        let session1;
        let session2;
        let anotherUser1;

        before('Create the users', async() => {
            anotherUser1 = await userService.addUser('blem', 'Kalob', 'blemkalob@iets.be', null, 'blemkalbo');
            assert.isOk(anotherUser1);
        });

        before('Create the sessions', async() => {
            session1 = await sessionService.addSession('Test session', 'test session creation', 'opportunity', 3, 5, [],
                true, false, [globalTestUser], globalTestTheme, globalTestUser, null, null, null);
            assert.isOk(session1);

            session2 = await sessionService.addSession('Test session 2', 'test session creation', 'opportunity', 3, 5, [],
                true, false, [globalTestUser], globalTestTheme, globalTestUser, null, null, null);
            assert.isOk(session2);
        });

        before('Invite the users to their sessions', async function () {
            let invitees = session1.invitees;
            invitees.push(anotherUser1.emailAddress);
            session1 = await sessionService.updateInvitees(session1._id, invitees);
            assert.isOk(session1);
            assert.isTrue(session1.invitees.includes(anotherUser1.emailAddress));
        });

        it('Get sessions by invitee - anotherUser1', (done) => {
            chai.request(server)
                .get('/user/' + anotherUser1._id + '/sessions/invited')
                .set('X-Access-Token', globalTestUser_token)
                .send()
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.property('sessions');
                    assert.isOk(res.body.sessions);
                    assert.isArray(res.body.sessions);
                    assert.strictEqual(res.body.sessions.length, 1);
                    let sessionsToTitle = res.body.sessions.map(session => session.title);
                    assert.isTrue(sessionsToTitle.includes('Test session'));
                    done();
                });

        });

        after('Remove the sessions & user', async() => {
            let successful = await userService.removeUser(anotherUser1._id);
            assert.isTrue(successful);
            successful = await sessionService.removeSession(session1._id);
            assert.isTrue(successful);
            successful = await sessionService.removeSession(session2._id);
            assert.isTrue(successful);
        });

    });

    describe('/GET /user/:userId/sessions/participating', () => {
        let session1;
        let session2;
        let anotherUser1;

        before('Create the users', async() => {
            anotherUser1 = await userService.addUser('blem', 'Kalob', 'blemkalob@iets.be', null, 'blemkalbo');
            assert.isOk(anotherUser1);
        });

        before('Create the sessions', async() => {
            session1 = await sessionService.addSession('Test session', 'test session creation', 'opportunity', 3, 5, [],
                true, false, [globalTestUser], globalTestTheme, globalTestUser, null, null, null);
            assert.isOk(session1);

            session2 = await sessionService.addSession('Test session 2', 'test session creation', 'opportunity', 3, 5, [],
                true, false, [globalTestUser, anotherUser1], globalTestTheme, globalTestUser, null, null, null);
            assert.isOk(session2);
        });

        it('Get sessions by participant - anotherUser1', (done) => {
            chai.request(server)
                .get('/user/' + anotherUser1._id + '/sessions/participating')
                .set('X-Access-Token', globalTestUser_token)
                .send()
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.property('sessions');
                    assert.isOk(res.body.sessions);
                    assert.isArray(res.body.sessions);
                    assert.strictEqual(res.body.sessions.length, 1);
                    let sessionsToTitle = res.body.sessions.map(session => session.title);
                    assert.isTrue(sessionsToTitle.includes('Test session 2'));
                    done();
                });

        });

        after('Remove the sessions & user', async() => {
            let successful = await userService.removeUser(anotherUser1._id);
            assert.isTrue(successful);
            successful = await sessionService.removeSession(session1._id);
            assert.isTrue(successful);
            successful = await sessionService.removeSession(session2._id);
            assert.isTrue(successful);
        });

    });

    describe('/POST /session/:sessionId/copy', function () {
        let session;
        let copiedSession;

        before('Create a session', async() => {
            session = await sessionService.addSession('Welke pudding eten we deze week?', 'Test om sessie aan te maken', 'opportunity',
                2, 5, [],
                true, false, [globalTestUser], globalTestTheme, globalTestUser, null, null, null);
            assert.isOk(session);
        });

        it('Copy the session', (done) => {
            chai.request(server)
                .post('/session/' + session._id + '/copy')
                .set('X-Access-Token', globalTestUser_token)
                .send({})
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.have.property('session');
                    copiedSession = res.body.session;
                    assert.strictEqual(copiedSession.title, session.title);
                    assert.strictEqual(copiedSession.description, session.description);
                    done();
                });
        });

        after('Remove the two sessions', async() => {
            let successful = await sessionService.removeSession(session._id);
            assert.isTrue(successful);
            successful = await sessionService.removeSession(copiedSession._id);
            assert.isTrue(successful);
        });
    });

    describe('Test playing the game - events', function () {
        let session;
        let cards = [];
        let anotherUser;
        let turns = [];

        before('Create anotherUser and session of which both anotherUser and testUser are a participant', async() => {
            anotherUser = await userService.addUser('blem', 'Kalob', 'blemkalob@iets.be', null, 'blemkalbo');
            assert.isOk(anotherUser);

            session = await sessionService.addSession('Test session', 'test session creation', 'opportunity', 3, 5, [],
                true, false, [globalTestUser, anotherUser], globalTestTheme, globalTestUser, null, null, null);
            assert.isOk(session);
        });

        before('Add cards to the session', async function () {
            this.timeout(10000);
            cards.push(await cardService.addCard("first card", globalTestTheme._id));
            cards.push(await cardService.addCard("second card", globalTestTheme._id));
            cards.push(await cardService.addCard("third card", globalTestTheme._id));
            cards.push(await cardService.addCard("fourth card", globalTestTheme._id));
            cards.push(await cardService.addCard("fifth card", globalTestTheme._id));
            cards.push(await cardService.addCard("sixth card", globalTestTheme._id));

            let toUpdate = {
                sessionCards: session.sessionCards
            };

            cards.forEach(function (card) {
                toUpdate.sessionCards.push(card);
            });

            session = await sessionService.changeSession(session._id, toUpdate);
            assert.isOk(session);
            assert.strictEqual(session.sessionCards.length, 6);
        });

        before('Pick cards for the session - testUser', async() => {
            let userCards = cards.slice(0, 4);
            let pickedCards = await sessionService.pickCards(session._id, globalTestUser._id, userCards);
            assert.isOk(pickedCards);
            assert.isArray(pickedCards.cards);
            let userCardsAsStrings = userCards.map(card => card._id.toString());
            let pickedCardsAsStrings = pickedCards.cards.map(pickedCard => pickedCard.toString());
            assert.strictEqual(userCardsAsStrings.length, pickedCardsAsStrings.length);
            assert.strictEqual(pickedCards.cards.length, 4);
            assert.isTrue(pickedCardsAsStrings.includes(userCardsAsStrings[0]));
            assert.isTrue(pickedCardsAsStrings.includes(userCardsAsStrings[1]));
            assert.isTrue(pickedCardsAsStrings.includes(userCardsAsStrings[2]));
            assert.isTrue(pickedCardsAsStrings.includes(userCardsAsStrings[3]));
        });

        before('Pick cards for the session - anotherUser', async() => {
            let userCards = cards.slice(2);
            let pickedCards = await sessionService.pickCards(session._id, anotherUser._id, userCards);
            assert.isOk(pickedCards);
            assert.isArray(pickedCards.cards);
            let userCardsAsStrings = userCards.map(card => card._id.toString());

            let pickedCardsAsStrings = pickedCards.cards.map(pickedCard => pickedCard.toString());

            assert.strictEqual(userCardsAsStrings.length, pickedCardsAsStrings.length);
            assert.strictEqual(pickedCards.cards.length, 4);
            assert.isTrue(pickedCardsAsStrings.includes(userCardsAsStrings[0]));
            assert.isTrue(pickedCardsAsStrings.includes(userCardsAsStrings[1]));
            assert.isTrue(pickedCardsAsStrings.includes(userCardsAsStrings[2]));
            assert.isTrue(pickedCardsAsStrings.includes(userCardsAsStrings[3]));
        });

        before('Perform events', async function() {
            this.timeout(15000);
            session = await sessionService.startSession(session._id, globalTestUser._id);
            assert.isOk(session);

            let randomCard = Math.floor((Math.random() * 5) + 0);
            assert.isTrue(session.currentUser._id.toString() === globalTestUser._id.toString());
            session = await sessionService.playTurn(session._id, globalTestUser._id, cards[randomCard]._id);
            turns.push(cards[randomCard]._id);
            assert.isOk(session);

            session = await sessionService.pauseSession(session._id, globalTestUser._id);
            assert.isOk(session);

            session = await sessionService.pauseSession(session._id, globalTestUser._id);
            assert.isOk(session);

            randomCard = Math.floor((Math.random() * 5) + 0);
            assert.isTrue(session.currentUser._id.toString() === anotherUser._id.toString());
            session = await sessionService.playTurn(session._id, anotherUser._id, cards[randomCard]._id);
            turns.push(cards[randomCard]._id);
            assert.isOk(session);
        });

        it('Retrieve the events of a session', (done) => {
            chai.request(server)
                .get('/session/' + session._id + '/history')
                .set('X-Access-Token', globalTestUser_token)
                .send()
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.property('events');

                    let events = res.body.events;
                    assert.isArray(events);
                    assert.strictEqual(events.length, 5);

                    assert.strictEqual(events[0].eventType, 'start');
                    assert.strictEqual(events[1].eventType, 'turn');
                    assert.strictEqual(events[1].content.toString(), turns[0].toString());
                    assert.strictEqual(events[2].eventType, 'pause');
                    assert.strictEqual(events[3].eventType, 'pause');
                    assert.strictEqual(events[4].eventType, 'turn');
                    assert.strictEqual(events[4].content.toString(), turns[1].toString());

                    done();
                });
        });

        after('Remove the created objects', async() => {
            let successful = await sessionService.removeSession(session._id);
            assert.isTrue(successful);
            successful = await userService.removeUser(anotherUser._id);
            assert.isTrue(successful);
            cards.forEach(async function (card) {
                let successful = await cardService.removeCard(card._id);
                assert.isTrue(successful);
            });
        });
    });

    after('remove testuser & test theme', async function () {
        let successful = await userService.removeUser(globalTestUser._id);
        assert.isTrue(successful);

        successful = await themeService.removeTheme(globalTestTheme._id);
        assert.isTrue(successful);
    });

});