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

    before('Initialise test user', (done) => {
        userService.createUser('Jos', 'Nikkel', 'jos.nikkel@teamjs.xyz', 'Karel de Grote Hogeschool - TeamJS', 'myAwesomePassword.123', function (user, err) {
            assert.isNotOk(err);
            assert.isOk(user);
            testUser = user;
            done();
        });
    });

    before('Initialise test theme', (done) => {
        themeService.addTheme('first theme', 'a description', [], true, testUser, null, function (theme, err) {
            assert.isNotOk(err);
            assert.isOk(theme);
            testTheme = theme;
            done();
        });
    });

    before('Initialise test dates', (done) => {
        testDate = new Date(2017, 8, 2, 16, 20, 0);
        testDateInPast = new Date(2016, 9, 2, 16, 20, 0);
        done();
    });

    describe('Creating a session', () => {
        it('Create a session', (done) => {
            sessionService.createSession('Test session', 'test session creation', 'opportunity', 3, 5, [],
                true, false, [testUser], testTheme, testUser, testDate, null, null,
                (session, err) => {
                    assert.isNotOk(err);
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

                    sessionService.deleteSession(session._id,
                        (success, err) => {
                            assert.isNotOk(err);
                            assert.isTrue(success);

                            done();
                        })
                });
        });

        it('Create a session - no startDate', (done) => {
            sessionService.createSession('Test session', 'test session creation', 'opportunity', 3, 5, [],
                true, false, [testUser], testTheme, testUser, null, null, null,
                (session, err) => {
                    assert.isNotOk(err);
                    assert.isOk(session);

                    assert.isNotOk(session.startDate);

                    sessionService.deleteSession(session._id,
                        (success, err) => {
                            assert.isNotOk(err);
                            assert.isTrue(success);

                            done();
                        })
                });
        });

        it('Create a session - invalid circle type', (done) => {
            sessionService.createSession('Test session', 'test session creation', 'pudding', 3, 5, [],
                true, false, [testUser], testTheme, testUser, null, null, null,
                (session, err) => {
                    assert.isOk(err);
                    assert.isNotOk(session);

                    assert.strictEqual(err.message, 'Invalid circle type. Circle type should be "opportunity" or "threat".');
                    done();
                });
        });
    });

    describe('Get a session', () => {
        let get_session;
        before('Create a session', (done) => {
            sessionService.createSession('Test session', 'test session creation', 'opportunity', 3, 5, [],
                true, false, [testUser], testTheme, testUser, null, null, null,
                (session, err) => {
                    assert.isNotOk(err);
                    assert.isOk(session);

                    get_session = session;
                    done();
                });
        });

        it('Get an existing session', (done) => {
            sessionService.getSession(get_session._id,
                (session, err) => {
                    assert.isNotOk(err);
                    assert.isOk(session);

                    assert.strictEqual(session._id.toString(), get_session._id.toString());
                    assert.strictEqual(session.title, get_session.title);

                    done();
                });
        });

        it('Get a non-existing session', (done) => {
            sessionService.getSession('00aa0aa000a000000a0000aa',
                (session, err) => {
                    assert.isOk(err);
                    assert.isNotOk(session);

                    assert.strictEqual(err.message, 'Unable to find session with id ' + '00aa0aa000a000000a0000aa');

                    done();
                });
        });

        after('Remove the session', (done) => {
            sessionService.deleteSession(get_session._id,
                (success, err) => {
                    assert.isNotOk(err);
                    assert.isTrue(success);

                    done();
                })
        });
    });

    describe('Remove a session', () => {
        let remove_session;
        before('Create a session', (done) => {
            sessionService.createSession('Test session', 'test session creation', 'opportunity', 3, 5, [],
                true, false, [testUser], testTheme, testUser, null, null, null,
                (session, err) => {
                    assert.isNotOk(err);
                    assert.isOk(session);

                    remove_session = session;
                    done();
                });
        });

        it('Remove an existing session', (done) => {
            sessionService.deleteSession(remove_session._id,
                (success, err) => {
                    assert.isNotOk(err);
                    assert.isTrue(success);

                    sessionService.getSession(remove_session._id,
                        (session, err) => {
                            assert.isOk(err);
                            assert.isNotOk(session);

                            assert.strictEqual(err.message, 'Unable to find session with id ' + remove_session._id);
                            done();
                        });
                });
        });

        it('Remove a non-existing session', (done) => {
            sessionService.deleteSession('00aa0aa000a000000a0000aa',
                (session, err) => {
                    assert.isOk(err);
                    assert.isNotOk(session);

                    assert.strictEqual(err.message, 'Unable to find session with id ' + '00aa0aa000a000000a0000aa');

                    done();
                });
        });
    });

    describe('Get all session of a theme', () => {
        it('Retrieve all sessions - no sessions', (done) => {
            sessionService.getSessions(testTheme._id,
                (sessions, err) => {
                    assert.isNotOk(err);
                    assert.isOk(sessions);

                    assert.isArray(sessions);
                    assert.strictEqual(sessions.length, 0);
                    done();
                })
        });

        describe('Retrieve all sessions - a single session', () => {
            let get_all_sessions;
            before('Create a session', (done) => {
                sessionService.createSession('Test session', 'test session creation', 'opportunity', 3, 5, [],
                    true, false, [testUser], testTheme, testUser, null, null, null,
                    (session, err) => {
                        assert.isNotOk(err);
                        assert.isOk(session);

                        get_all_sessions = session;
                        done();
                    });
            });

            it('Retrieve all sessions', (done) => {
                sessionService.getSessions(testTheme._id,
                    (sessions, err) => {
                        assert.isNotOk(err);
                        assert.isOk(sessions);

                        assert.isArray(sessions);
                        assert.strictEqual(sessions.length, 1);

                        assert.strictEqual(sessions[0]._id.toString(), get_all_sessions._id.toString());
                        done();
                    })
            });

            after('Remove the session', (done) => {
                sessionService.deleteSession(get_all_sessions._id,
                    (success, err) => {
                        assert.isNotOk(err);
                        assert.isTrue(success);

                        done();
                    })
            });
        });

        describe('Retrieve all sessions - 2 sessions', () => {
            let get_all_sessions1;
            let get_all_sessions2;
            before('Create a session', (done) => {
                sessionService.createSession('Test session', 'test session creation', 'opportunity', 3, 5, [],
                    true, false, [testUser], testTheme, testUser, null, null, null,
                    (session, err) => {
                        assert.isNotOk(err);
                        assert.isOk(session);

                        get_all_sessions1 = session;
                        done();
                    });
            });

            before('Create another session', (done) => {
                sessionService.createSession('Test session', 'test session creation', 'opportunity', 3, 5, [],
                    true, false, [testUser], testTheme, testUser, null, null, null,
                    (session, err) => {
                        assert.isNotOk(err);
                        assert.isOk(session);

                        get_all_sessions2 = session;
                        done();
                    });
            });

            it('Retrieve all sessions', (done) => {
                sessionService.getSessions(testTheme._id,
                    (sessions, err) => {
                        assert.isNotOk(err);
                        assert.isOk(sessions);

                        assert.isArray(sessions);
                        assert.strictEqual(sessions.length, 2);

                        assert.strictEqual(sessions[0]._id.toString(), get_all_sessions1._id.toString());
                        assert.strictEqual(sessions[1]._id.toString(), get_all_sessions2._id.toString());
                        done();
                    })
            });

            after('Remove the first session', (done) => {
                sessionService.deleteSession(get_all_sessions1._id,
                    (success, err) => {
                        assert.isNotOk(err);
                        assert.isTrue(success);

                        done();
                    })
            });

            after('Remove the second session', (done) => {
                sessionService.deleteSession(get_all_sessions2._id,
                    (success, err) => {
                        assert.isNotOk(err);
                        assert.isTrue(success);

                        done();
                    })
            })
        });
    });

    describe('Start a session', function () {
        describe('Start a session immediately', function () {
            let start_session;
            before('Create a session', function (done) {
                sessionService.createSession('Test session', 'test session creation', 'opportunity', 3, 5, [],
                    true, false, [testUser], testTheme, testUser, null, null, null,
                    (session, err) => {
                        assert.isNotOk(err);
                        assert.isOk(session);

                        assert.isTrue(!session.startDate || session.startDate > new Date());

                        start_session = session;
                        done();
                    });
            });

            it('Start a session instance', function (done) {
                sessionService.changeSession(start_session._id, {startDate : Date.now()},function (success, err) {
                    assert.isNotOk(err);
                    assert.isTrue(success);
                    // done();

                    sessionService.getSession(start_session._id, (session, err) => {
                        assert.isNotOk(err);
                        assert.isOk(session);

                        assert.isOk(session.startDate && session.startDate <= new Date());
                        done();
                    });
                });
            });

            after('Remove the session', function (done) {
                sessionService.deleteSession(start_session._id, function (success, err) {
                    assert.isNotOk(err);
                    assert.isTrue(success);

                    done();
                });
            });
        });

        console.log("Fix unable to start a session that has already started.");
        // TODO fix me
        // describe('A session can not be started if it already is started', function () {
        //     let start_session_already_started;
        //     before('Create a session', function (done) {
        //         sessionService.createSession('Test session', 'test session creation', 'opportunity', 3, 5, [],
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
        //         sessionService.deleteSession(start_session_already_started._id, function (success, err) {
        //             assert.isNotOk(err);
        //             assert.isTrue(success);
        //
        //             done();
        //         });
        //     });
        // })
    });

    after('Remove test user', (done) => {
        userService.removeUser(testUser._id, function (success, err) {
            assert.isNotOk(err);
            assert.isTrue(success, 'testuser should have succesfully been deleted');
            done();
        })
    });

    after('Remove test theme', (done) => {
        themeService.removeTheme(testTheme._id, function (success, err) {
            assert.isNotOk(err);
            assert.isTrue(success);

            done();
        });
    });

});