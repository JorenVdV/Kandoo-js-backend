/**
 * Created by steve on 2/22/2017.
 */
process.env.NODE_ENV = 'test';
const chai = require('chai');
const assert = chai.assert;

const sessionService = require('../../services/session-service');
const themeService = require('../../services/theme-service');
// const cardService = require('../../services/card-service');
const userService = require('../../services/user-service');

describe('Session service tests', () => {
    let testUser;
    let testTheme;
    let testDate;
    let testDateInPast;

    before('Initialise test user & test theme & test dates', async function () {
        testUser = await userService.addUser('Jos', 'Nikkel', 'jos.nikkel@teamjs.xyz', 'Karel de Grote Hogeschool - TeamJS', 'myAwesomePassword.123');
        assert.isOk(testUser);
        testTheme = await themeService.addTheme('first theme', 'a description', [], true, testUser, null);
        assert.isOk(testTheme);

        testDate = new Date(2017, 8, 2, 16, 20, 0);
        testDateInPast = new Date(2016, 9, 2, 16, 20, 0);
    });

    describe('Creating a session', () => {
        it('Create a session', async() => {
            let session = await sessionService.addSession('Test session', 'test session creation', 'opportunity', 3, 5, [],
                true, false, [testUser], testTheme, testUser, testDate, null, null);
            assert.isOk(session);

            assert.strictEqual(session.title, "Test session");
            assert.strictEqual(session.description, "test session creation");
            assert.strictEqual(session.circleType, 'opportunity');
            assert.strictEqual(session.minCardsPerParticipant, 3);
            assert.strictEqual(session.maxCardsPerParticipant, 5);
            assert.isArray(session.cards);
            assert.strictEqual(session.cards.length, 0);
            assert.strictEqual(session.cardsCanBeReviewed, true);
            assert.strictEqual(session.cardsCanBeAdded, false);
            assert.strictEqual(session.participants.length, 1);
            assert.strictEqual(session.participants[0]._id.toString(), testUser._id.toString());
            assert.strictEqual(session.theme._id.toString(), testTheme._id.toString());
            assert.strictEqual(session.amountOfCircles, 5);
            assert.strictEqual(session.turnDuration, 60000);
            assert.isOk(session.startDate);
            let sessionDate = session.startDate;
            assert.strictEqual(sessionDate.getFullYear(), 2017);
            assert.strictEqual(sessionDate.getMonth(), 8);
            assert.strictEqual(sessionDate.getDate(), 2);
            assert.strictEqual(sessionDate.getHours(), 16);
            assert.strictEqual(sessionDate.getMinutes(), 20);
            assert.strictEqual(sessionDate.getSeconds(), 0);

            let successful = await sessionService.removeSession(session._id);
            assert.isTrue(successful);
        });

        it('Create a session - no startDate', async() => {
            let session = await sessionService.addSession('Test session', 'test session creation', 'opportunity', 3, 5, [],
                true, false, [testUser], testTheme, testUser, null, null, null);
            assert.isOk(session);
            assert.isNotOk(session.startDate);
            let successful = await sessionService.removeSession(session._id);
            assert.isTrue(successful);
        });

        it('Create a session - invalid circle type', async() => {
            try {
                let session = await sessionService.addSession('Test session', 'test session creation', 'pudding', 3, 5, [],
                    true, false, [testUser], testTheme, testUser, null, null, null);
                assert.isNotOk(session);
            } catch (err) {
                assert.isOk(err);
                assert.strictEqual(err.message, 'Invalid circle type. Circle type should be "opportunity" or "threat".');
            }
        });
    });

    describe('Get a session', () => {
        let get_session;
        before('Create a session', async() => {
            get_session = await sessionService.addSession('Test session', 'test session creation', 'opportunity', 3, 5, [],
                true, false, [testUser], testTheme, testUser, null, null, null);
            assert.isOk(get_session);
        });

        it('Get an existing session', async() => {
            let session = await sessionService.getSession(get_session._id);
            assert.isOk(session);
            assert.strictEqual(session._id.toString(), get_session._id.toString());
            assert.strictEqual(session.title, get_session.title);
        });

        it('Get a non-existing session', async() => {
            try {
                let session = await sessionService.getSession('00aa0aa000a000000a0000aa');
                assert.isNotOk(session);
            } catch (err) {
                assert.isOk(err);
                assert.strictEqual(err.message, 'Unable to find session with id: ' + '00aa0aa000a000000a0000aa');
            }
        });

        after('Remove the session', async() => {
            let successful = await sessionService.removeSession(get_session._id);
            assert.isTrue(successful);
        });
    });

    describe('Remove a session', () => {
        let remove_session;
        before('Create a session', async() => {
            remove_session = await sessionService.addSession('Test session', 'test session creation', 'opportunity', 3, 5, [],
                true, false, [testUser], testTheme, testUser, null, null, null);
            assert.isOk(remove_session);
        });

        it('Remove an existing session', async() => {
            let successful = await sessionService.removeSession(remove_session._id);
            assert.isTrue(successful);
        });

        it('Remove a non-existing session', async() => {
            try {
                let successful = await sessionService.removeSession('00aa0aa000a000000a0000aa');
                assert.isNotOk(successful);
            } catch (err) {
                assert.isOk(err);
                assert.strictEqual(err.message, 'Unable to find session with id: ' + '00aa0aa000a000000a0000aa');
            }
        });
    });

    describe('Get all session of a theme', () => {
        it('Retrieve all sessions - no sessions', async() => {
            let sessions = await sessionService.getSessionsByTheme(testTheme._id);
            assert.isOk(sessions);

            assert.isArray(sessions);
            assert.strictEqual(sessions.length, 0);
        });

        describe('Retrieve all sessions - a single session', () => {
            let get_all_sessions;
            before('Create a session', async() => {
                get_all_sessions = await sessionService.addSession('Test session', 'test session creation', 'opportunity', 3, 5, [],
                    true, false, [testUser], testTheme, testUser, null, null, null);
                assert.isOk(get_all_sessions);
            });

            it('Retrieve all sessions', async() => {
                let sessions = await sessionService.getSessionsByTheme(testTheme._id);
                assert.isOk(sessions);
                assert.isArray(sessions);
                assert.strictEqual(sessions.length, 1);
                assert.strictEqual(sessions[0]._id.toString(), get_all_sessions._id.toString());
            });

            after('Remove the session', async() => {
                let successful = await sessionService.removeSession(get_all_sessions._id);
                assert.isTrue(successful);
            });
        });

        describe('Retrieve all sessions - 2 sessions', () => {
            let get_all_sessions1;
            let testUser2;
            let get_all_sessions2;

            before('Create the sessions & second user', async() => {
                get_all_sessions1 = await sessionService.addSession('Test session', 'test session creation', 'opportunity', 3, 5, [],
                    true, false, [testUser], testTheme, testUser, null, null, null);
                assert.isOk(get_all_sessions1);
                testUser2 = await userService.addUser('Jos', 'Nikkel1', 'jos.nikkel1@teamjs.xyz', 'Karel de Grote Hogeschool - TeamJS', 'myAwesomePassword.123');
                assert.isOk(testUser2);
                get_all_sessions2 = await sessionService.addSession('Test session', 'test session creation', 'opportunity', 3, 5, [],
                    true, false, [testUser2], testTheme, testUser2, null, null, null);
                assert.isOk(get_all_sessions2);
            });

            it('Retrieve all sessions', async() => {
                let sessions = await sessionService.getSessionsByTheme(testTheme._id);
                assert.isOk(sessions);

                assert.isArray(sessions);
                assert.strictEqual(sessions.length, 2);

                assert.strictEqual(sessions[0]._id.toString(), get_all_sessions1._id.toString());
                assert.strictEqual(sessions[1]._id.toString(), get_all_sessions2._id.toString());
            });

            it('Retrieve all sessions - per participant', async() => {
                let sessions1 = await sessionService.getSessionsByParticipant(testUser._id);
                assert.isOk(sessions1);
                assert.isArray(sessions1);
                assert.strictEqual(sessions1.length, 1);
                assert.strictEqual(sessions1[0]._id.toString(), get_all_sessions1._id.toString());

                let sessions2 = await sessionService.getSessionsByParticipant(testUser2._id);
                assert.isOk(sessions2);
                assert.isArray(sessions2);
                assert.strictEqual(sessions2.length, 1);
                assert.strictEqual(sessions2[0]._id.toString(), get_all_sessions2._id.toString());
            });

            after('Remove the sessions & second user', async () => {
                let successful = await sessionService.removeSession(get_all_sessions1._id);
                assert.isTrue(successful);
                successful = await sessionService.removeSession(get_all_sessions2._id);
                assert.isTrue(successful);
                successful = await userService.removeUser(testUser2._id);
                assert.isTrue(successful);
            });
        });
    });

    describe('Start a session', function () {
        console.log("Fix start a session.");
        // describe('Start a session immediately', function () {
        //     let start_session;
        //     before('Create a session', function (done) {
        //         sessionService.addSession('Test session', 'test session creation', 'opportunity', 3, 5, [],
        //             true, false, [testUser], testTheme, testUser, null, null, null,
        //             (session, err) => {
        //                 assert.isNotOk(err);
        //                 assert.isOk(session);
        //
        //                 assert.isTrue(!session.startDate || session.startDate > new Date());
        //
        //                 start_session = session;
        //                 done();
        //             });
        //     });
        //
        //     it('Start a session instance', function (done) {
        //         sessionService.changeSession(start_session._id, {startDate: Date.now()}, function (success, err) {
        //             assert.isNotOk(err);
        //             assert.isTrue(success);
        //             // done();
        //
        //             sessionService.getSession(start_session._id, (session, err) => {
        //                 assert.isNotOk(err);
        //                 assert.isOk(session);
        //
        //                 assert.isOk(session.startDate && session.startDate <= new Date());
        //                 done();
        //             });
        //         });
        //     });
        //
        //     after('Remove the session', function (done) {
        //         sessionService.removeSession(start_session._id, function (success, err) {
        //             assert.isNotOk(err);
        //             assert.isTrue(success);
        //
        //             done();
        //         });
        //     });
        // });

        console.log("Fix unable to start a session that has already started.");
        // TODO fix me
        // describe('A session can not be started if it already is started', function () {
        //     let start_session_already_started;
        //     before('Create a session', function (done) {
        //         sessionService.addSession('Test session', 'test session creation', 'opportunity', 3, 5, [],
        //             true, false, [testUser], testTheme, testUser, testDateInPast, null, null,
        //             (session, err) => {
        //                 assert.isNotOk(err);
        //                 assert.isOk(session);
        //
        //                 assert.isTrue(session.startDate <= Date.now());
        //
        //                 start_session_already_started = session;
        //                 done();
        //             });
        //     });
        //
        //     it('a session can not be started if it already is started', function (done) {
        //         sessionService.changeSession(start_session_already_started._id, {startDate: testDateInPast}, function (success, err) {
        //             assert.isOk(err);
        //             assert.isFalse(success);
        //
        //             assert.strictEqual(err.message, 'Unable to start a session that has already started');
        //             done();
        //         });
        //     });
        //
        //     after('Remove the session', function (done) {
        //         sessionService.removeSession(start_session_already_started._id, function (success, err) {
        //             assert.isNotOk(err);
        //             assert.isTrue(success);
        //
        //             done();
        //         });
        //     });
        // })

        // describe('play a turn', function () {
        //     it('should add a turn to the session with a card and it\'s priority', function (done) {
        //
        //         let session = sessionService
        //             .addSession('testSession', 'testing the creation of a session', 'blue',
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
        //             .addSession('testSession', 'testing the creation of a session', 'blue',
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
        //             .addSession('testSession', 'testing the creation of a session', 'blue',
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
        //             .addSession('testSession', 'testing the creation of a session', 'blue',
        //                 60000, {min: 3, max: 10}, [], false, false, [testGlobal.testUser],
        //                 testGlobal.testTheme, testGlobal.testUser);
        //         sessionService.startSession(session._id);
        //         sessionService.stopSession(session._id);
        //         assert(session.endDate, 'endDate should be defined');
        //     });
        //
        //     before('setup second user', function(done){
        //         userService.addUser('this is a test', 'testubg', 'nickjorens@gmail.com', 'd', 'test', function(user, err){
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
    });

    after('Remove test user & test theme', async() => {
        let successful = await userService.removeUser(testUser._id);
        assert.isTrue(successful);
        successful = await themeService.removeTheme(testTheme._id);
        assert.isTrue(successful);
    });

});