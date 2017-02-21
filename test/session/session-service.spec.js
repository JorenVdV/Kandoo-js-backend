/**
 * Created by steve on 2/8/2017.
 */
process.env.NODE_ENV = 'test';

const chai = require('chai');
const assert = chai.assert;

const sessionService = require('../../services/session-service');
const cardService = require('../../services/card-service');
const themeService = require('../../services/theme-service');
const userService = require('../../services/user-service');

var nodemailer = require('nodemailer');
var mockTransport = require('../../node_modules/nodemailer-mock-transport/index');

describe('Session service tests -', function () {
    let testGlobal = {};
    before('setup test user', function (done) {
        userService.createUser('test', 'Testi', 'test.Testi@teamjs.xyz', 'Karel de Grote Hogeschool - TeamJS', 'myAwesomePassword.123', function (user, err) {
            assert.isNotOk(err);
            assert.isOk(user);
            testGlobal.testUser = user;
            done();
        });
    });

    before('setup test theme', function (done) {
        themeService.addTheme('Test theme', 'test description', ['testTag'], false, testGlobal.testUser, [], function (theme, err) {
            assert.isNotOk(err);
            assert.isOk(theme);
            testGlobal.testTheme = theme;
            done();
        })
    });

    before('setup test theme and testuser with card in that theme', function () {
        let testDate = new Date(2017, 8, 2, 16, 20, 0);
        let testDate2 = new Date(2017, 9, 2, 16, 20, 0);
        let card = cardService.addCard("This is a test");
        themeService.addCard(testGlobal.testTheme._id, card, function (theme, err) {

        });
        testGlobal.testDate = testDate;
        testGlobal.testDate2 = testDate2;
        testGlobal.card = card;
    });

    describe('Creating a session:', function () {

        it('Create a session on a theme', function (done) {
            //title, description, circleType, roundDuration, cardsPerParticipant,cards, canReview, canAddCards, theme, creator, startDate = null)
            let callback = function (session, err) {
                assert.isNotOk(err);
                assert.isOk(session);

                assert.strictEqual(session.title, 'Test session');
                assert.strictEqual(session.description, 'test session creation');
                assert.strictEqual(session.circleType, 'opportunity');
                assert.strictEqual(session.turnDuration, 60000);
                assert.strictEqual(session.cardsPerParticipant.min, 3);
                assert.strictEqual(session.cardsPerParticipant.max, 5);
                assert.strictEqual(session.cardsCanBeReviewed, true);
                assert.strictEqual(session.cardsCanBeAdded, false);
                assert.strictEqual(session.participants.length, 1);

                console.log(session);

                assert.strictEqual(session.participants[0]._id, testGlobal.testUser._id);

                let sessionDate = new Date(session.startDate);
                assert(sessionDate.getFullYear() === 2017 && sessionDate.getMonth() === 8
                    && sessionDate.getDate() === 2 && sessionDate.getHours() === 16
                    && sessionDate.getMinutes() === 20 && sessionDate.getSeconds() === 0, 'session should start at 2-8-2017 16:20:00');
                assert.equal(session.theme._id, testGlobal.testTheme._id);
                assert.equal(session.creator, testGlobal.testUser._id);

                assert.strictEqual(session.amountOfCircles, 5);

                sessionService.deleteSession(session._id, function (success, err) {
                    assert.isNotOk(err);
                    assert.isTrue(success);

                    done();
                });
            };
            sessionService.createSession('Test session', 'test session creation', 'opportunity', {min: 3, max: 5}, [],
                true, false, [testGlobal.testUser], testGlobal.testTheme, testGlobal.testUser, callback, testGlobal.testDate);
        });

        it('Create a session on a theme - no startDate', function (done) {
            //title, description, circleType, roundDuration, cardsPerParticipant,cards, canReview, canAddCards, theme, creator, startDate = null)
            sessionService.createSession('Test session', 'test session creation', 'opportunity', {
                min: 3,
                max: 5
            }, [], true, false, [testGlobal.testUser], testGlobal.testTheme, testGlobal.testUser, function (session, err) {
                assert.isNotOk(err);
                assert.isOk(session);

                assert.isNotOk(session.startDate, 'start date should be null or undefined');

                sessionService.deleteSession(session._id, function (success, err) {
                    assert.isNotOk(err);
                    assert.isTrue(success);

                    done();
                });
            });
        });

        it('Create a session on a theme - invalid circle type', function (done) {
            //title, description, circleType, roundDuration, cardsPerParticipant,cards, canReview, canAddCards, theme, creator, startDate = null)
            sessionService.createSession('Test session', 'test session creation', 'pudding', {
                min: 3,
                max: 5
            }, [], true, false, [testGlobal.testUser], testGlobal.testTheme, testGlobal.testUser, function (session, err) {
                assert.isOk(err);
                assert.isNotOk(session);

                assert.strictEqual(err.message, 'Invalid circle type. Circle type should be "opportunity" or "threat".');

                done();
            }, testGlobal.testDate);
        });

    });

    describe('Get a session:', function () {
        let GETSession_session;
        before('Create a session to retrieve', function (done) {
            let callback = function (session, err) {
                assert.isNotOk(err);
                assert.isOk(session);

                GETSession_session = session;
                done();
            };
            sessionService.createSession('Test session', 'test session creation', 'opportunity', {min: 3, max: 5}, [],
                true, false, [testGlobal.testUser], testGlobal.testTheme, testGlobal.testUser, callback, testGlobal.testDate);
        });

        it('Retrieve a non existing session', function (done) {
            sessionService.getSession('00aa0aa000a000000a0000aa', function (session, err) {
                assert.isOk(err);
                assert.isNotOk(session);

                assert.strictEqual(err.message, 'Unable to find session with id ' + '00aa0aa000a000000a0000aa');
                done();
            });
        });

        it('Retrieve an existing session', function (done) {
            sessionService.getSession(GETSession_session._id, function (session, err) {
                assert.isNotOk(err);
                assert.isOk(session);

                assert.strictEqual(session._id.toString(), GETSession_session._id.toString());
                assert.strictEqual(session.title, GETSession_session.title);
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

    describe('Get all sessions of a theme:', function () {

        it('no existing sessions', function(done){
            sessionService.getSessions(testGlobal.testTheme._id, function(sessions,err){
                assert.isNotOk(err);
                assert.isOk(sessions);

                assert.isArray(sessions);
                assert.strictEqual(sessions.length, 0);

                done();
            });
        });

        describe('a single existing session', function(){
            let GETSessions_session;

            before('Create a session', function (done) {
                let callback = function (session, err) {
                    assert.isNotOk(err);
                    assert.isOk(session);

                    GETSessions_session = session;
                    done();
                };
                sessionService.createSession('Test session', 'test session creation', 'opportunity', {min: 3, max: 5}, [],
                    true, false, [testGlobal.testUser], testGlobal.testTheme, testGlobal.testUser, callback, testGlobal.testDate);
            });

            it('Retrieve all sessions', function (done) {
                sessionService.getSessions(testGlobal.testTheme._id, function(sessions,err){
                    assert.isNotOk(err);
                    assert.isOk(sessions);

                    assert.isArray(sessions);
                    assert.strictEqual(sessions.length, 1);
                    assert.strictEqual(sessions[0]._id.toString(), GETSessions_session._id.toString());

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

        describe('two existing sessions', function(){
            let GETSessions_session1;
            let GETSessions_session2;

            before('Create a session', function (done) {
                let callback = function (session, err) {
                    assert.isNotOk(err);
                    assert.isOk(session);

                    GETSessions_session1 = session;
                    done();
                };
                sessionService.createSession('Test session', 'test session creation', 'opportunity', {min: 3, max: 5}, [],
                    true, false, [testGlobal.testUser], testGlobal.testTheme, testGlobal.testUser, callback, testGlobal.testDate);
            });

            before('Create another session', function (done) {
                let callback = function (session, err) {
                    assert.isNotOk(err);
                    assert.isOk(session);

                    GETSessions_session2 = session;
                    done();
                };
                sessionService.createSession('Test session', 'test session creation', 'opportunity', {min: 3, max: 5}, [],
                    true, false, [testGlobal.testUser], testGlobal.testTheme, testGlobal.testUser, callback, testGlobal.testDate);
            });

            it('Retrieve all sessions', function (done) {
                sessionService.getSessions(testGlobal.testTheme._id, function(sessions,err){
                    assert.isNotOk(err);
                    assert.isOk(sessions);

                    assert.isArray(sessions);
                    assert.strictEqual(sessions.length, 2);
                    assert.strictEqual(sessions[0]._id.toString(), GETSessions_session1._id.toString());
                    assert.strictEqual(sessions[1]._id.toString(), GETSessions_session2._id.toString());

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

    describe('Remove a session', function(){
        let REMOVESession_session;

        before('Create a session', function (done) {
            let callback = function (session, err) {
                assert.isNotOk(err);
                assert.isOk(session);

                REMOVESession_session = session;
                done();
            };
            sessionService.createSession('Test session', 'test session creation', 'opportunity', {min: 3, max: 5}, [],
                true, false, [testGlobal.testUser], testGlobal.testTheme, testGlobal.testUser, callback, testGlobal.testDate);
        });

        it('Remove the session', function(done){
            sessionService.deleteSession(REMOVESession_session._id, function (success, err) {
                assert.isNotOk(err);
                assert.isTrue(success);

                done();
            });
        });

        it('Remove a non existing session', function(done){
            sessionService.deleteSession('00aa0aa000a000000a0000aa', function (success, err) {
                assert.isOk(err);
                assert.isFalse(success);

                assert.strictEqual(err.message, 'Unable to find session with id ' + '00aa0aa000a000000a0000aa');
                done();
            });
        })
    });

    //TODO fix start a session  & turn
    console.error('#####################################');
    console.error('# TODO: fix start a session  & turn #');
    console.error('#####################################');
    // describe('Start a session:', function () {
    //     it('start a session instance as an organiser', function (done) {
    //         let session = sessionService
    //             .createSession('testSession', 'testing the creation of a session', 'blue',
    //                 60000, {min: 3, max: 10}, [], false, false, [testGlobal.testUser],
    //                 testGlobal.testTheme, testGlobal.testUser);
    //         var beforeDate = new Date();
    //         sessionService.startSession(session._id);
    //         assert(session.startDate !== null, 'startdate of the session should been set');
    //         sessionService.deleteSession(session._id);
    //         assert(session.startDate !== null, 'startdate of the session should been set');
    //         // assert(session.startDate <= beforeDate, 'startdate of the session should been set');
    //         // assert(session.startDate >= new Date(), 'startdate of the session should been set');
    //         done();
    //     });
    //
    //     it('start a session on an specific date as an organiser', function (done) {
    //         session = sessionService
    //             .createSession('testSession', 'testing the creation of a session', 'blue',
    //                 60000, {min: 3, max: 10}, [], false, false, [testGlobal.testUser],
    //                 testGlobal.testTheme, testGlobal.testUser);
    //         sessionService.startSession(session._id, testGlobal.testDate);
    //         assert(session.startDate === testGlobal.testDate, 'startdate of the session should been set');
    //         sessionService.deleteSession(session._id);
    //         done();
    //     });
    //
    //     it('a session can not be started if it already is started', function (done) {
    //         let session = sessionService
    //             .createSession('testSession', 'testing the creation of a session', 'blue',
    //                 60000, {min: 3, max: 10}, [], false, false, [testGlobal.testUser],
    //                 testGlobal.testTheme, testGlobal.testUser);
    //         sessionService.startSession(session._id, testGlobal.testDate);
    //         assert.strictEqual(session.startDate, testGlobal.testDate, 'startdate should be equals tot testdate1');
    //         sessionService.startSession(session._id, testGlobal.testDate2);
    //         assert.strictEqual(session.startDate, testGlobal.testDate, 'startdate should be equals tot testdate');
    //         done();
    //     })
    // });
    //
    // describe('play a turn', function () {
    //     it('should add a turn to the session with a card and it\'s priority', function (done) {
    //
    //         let session = sessionService
    //             .createSession('testSession', 'testing the creation of a session', 'blue',
    //                 60000, {min: 3, max: 10}, [], false, false, [testGlobal.testUser],
    //                 testGlobal.testTheme._id, testGlobal.testUser, testGlobal.testDate);
    //
    //         sessionService.addTurn(session._id, testGlobal.card, testGlobal.testUser);
    //
    //
    //         assert.strictEqual(session.turns[0].card._id, testGlobal.card._id, 'The cards should be the same');
    //         assert.strictEqual(session.turns[0].priority, session.amountOfCircles - 1, 'The card should be 1 step closer to the middle');
    //         assert.strictEqual(session.turns[0].user._id, testGlobal.testUser._id, 'The user of the turn should be our user');
    //         done();
    //     });
    // });
    //
    // describe('Stop a session:', function () {
    //     it('ends a session as an organiser', function (done) {
    //         let session = sessionService
    //             .createSession('testSession', 'testing the creation of a session', 'blue',
    //                 60000, {min: 3, max: 10}, [], false, false, [testGlobal.testUser],
    //                 testGlobal.testTheme, testGlobal.testUser);
    //         sessionService.startSession(session._id);
    //         sessionService.stopSession(session._id);
    //         assert(session.endDate, 'endDate schould be defined');
    //         done();
    //     });
    //
    //     it('a session can not be stopped before it was started', function (done) {
    //         let session = sessionService
    //             .createSession('testSession', 'testing the creation of a session', 'blue',
    //                 60000, {min: 3, max: 10}, [], false, false, [testGlobal.testUser],
    //                 testGlobal.testTheme, testGlobal.testUser);
    //         sessionService.stopSession(session._id);
    //         assert(!session.endDate, 'endDate schould not be defined');
    //         done();
    //     });
    // });

    //TODO fix invite a user
    console.error('###########################');
    console.error('# TODO: fix invite a user #');
    console.error('###########################');
    // describe('Invite a user', function () {
    //     let session;
    //     before('setup 2 users and a session', function () {
    //         session = sessionService
    //             .createSession('testSession', 'testing the creation of a session', 'blue',
    //                 60000, {min: 3, max: 10}, [], false, false, [testGlobal.testUser],
    //                 testGlobal.testTheme, testGlobal.testUser);
    //         sessionService.startSession(session._id);
    //         sessionService.stopSession(session._id);
    //         assert(session.endDate, 'endDate should be defined');
    //     });
    //
    //     before('setup second user', function(done){
    //         userService.createUser('this is a test', 'testubg', 'nickjorens@gmail.com', 'd', 'test', function(user, err){
    //             assert.isNotOk(err);
    //             assert.isOk(user);
    //             testGlobal.testUser2 = user;
    //             done();
    //         });
    //     });
    //
    //     it('invites an existing user to a session', function (done) {
    //         sessionService.invite(session._id, testGlobal.testUser2._id);
    //         session = sessionService.getSession(session._id);
    //         console.log(session.invitees);
    //         assert.equal(session.invitees[0], testGlobal.testUser2._id, 'Session invitees list should contain id from testuser2');
    //         done();
    //     });
    //
    //     it('it should have 2 emails from inviting users.', function (done) {
    //         let mailService = require('../../services/mail-service');
    //         mailService.getTransporter().sentMail.length.should.equal(2);
    //         done();
    //     });
    //
    //     after('Remove the test user', function (done) {
    //         userService.removeUser(testGlobal.testUser2._id, function (succes, err) {
    //             assert.isNotOk(err);
    //             assert.isTrue(succes, 'user should have succesfully been deleted');
    //             done();
    //         })
    //     });
    //
    // });

    after('Remove the test theme', function (done) {
        themeService.removeTheme(testGlobal.testTheme._id, function (success, err) {
            assert.isNotOk(err);
            assert.isTrue(success, 'theme should have succesfully been deleted');
            done();
        });
    });

    after('Remove the test user', function (done) {
        userService.removeUser(testGlobal.testUser._id, function (success, err) {
            assert.isNotOk(err);
            assert.isTrue(success, 'user should have succesfully been deleted');
            done();
        });
    });
});