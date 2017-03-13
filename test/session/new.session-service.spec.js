/**
 * Created by steve on 2/22/2017.
 */
process.env.NODE_ENV = 'test';
const chai = require('chai');
const assert = chai.assert;

const sessionService = require('../../services/session-service');
const themeService = require('../../services/theme-service');
const cardService = require('../../services/card-service');
const userService = require('../../services/user-service');

require('../global');

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
            assert.isArray(session.sessionCards);
            assert.strictEqual(session.sessionCards.length, 0);
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

    describe('Copy a session', () => {
        let session;
        let newSession;
        before('Create a session', async() => {
            session = await sessionService.addSession('Test session', 'test session creation', 'opportunity', 3, 5, [],
                true, false, [testUser], testTheme, testUser, null, null, null);
            assert.isOk(session);
        });

        it('Copy the existing session', async() => {
            session = await sessionService.getSession(session._id);
            newSession = await sessionService.copySession(session._id);
            assert.isOk(newSession);
            assert.strictEqual(session.title, newSession.title);
            assert.strictEqual(session.description, newSession.description);
            assert.strictEqual(session.circleType, newSession.circleType);
            assert.strictEqual(session.minCardsPerParticipant, newSession.minCardsPerParticipant);
            assert.strictEqual(session.maxCardsPerParticipant, newSession.maxCardsPerParticipant);
            assert.strictEqual(session.cardsCanBeAdded, newSession.cardsCanBeAdded);
            assert.strictEqual(session.cardsCanBeReviewed, newSession.cardsCanBeReviewed);
            assert.strictEqual(session.theme.toString(), newSession.theme.toString());
            assert.strictEqual(session.participants[0]._id.toString(), newSession.participants[0].toString());
        });

        after('Remove the session', async() => {
            let successful = await sessionService.removeSession(session._id);
            assert.isTrue(successful);
            successful = await sessionService.removeSession(newSession._id);
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

            after('Remove the sessions & second user', async() => {
                let successful = await sessionService.removeSession(get_all_sessions1._id);
                assert.isTrue(successful);
                successful = await sessionService.removeSession(get_all_sessions2._id);
                assert.isTrue(successful);
                successful = await userService.removeUser(testUser2._id);
                assert.isTrue(successful);
            });
        });
    });

    describe('Get sessions by invitee', () => {
        let session1;
        let session2;
        let session3;
        let anotherUser1;
        let anotherUser2;

        before('Create the users', async () => {
            anotherUser1 = await userService.addUser('blem', 'Kalob', 'blemkalob@iets.be', null, 'blemkalbo');
            assert.isOk(anotherUser1);
            anotherUser2 = await userService.addUser('Jonas', 'Verlanders', 'jonasVerlanders@teamjs.be', null, 'jonas123');
            assert.isOk(anotherUser2);
        });

        before('Create the sessions', async () => {
            session1 = await sessionService.addSession('Test session', 'test session creation', 'opportunity', 3, 5, [],
                true, false, [testUser], testTheme, testUser, testDate, null, null);
            assert.isOk(session1);

            session2 = await sessionService.addSession('Test session 2', 'test session creation', 'opportunity', 3, 5, [],
                true, false, [testUser], testTheme, testUser, testDate, null, null);
            assert.isOk(session2);

            session3 = await sessionService.addSession('Test session 3', 'test session creation', 'opportunity', 3, 5, [],
                true, false, [testUser], testTheme, testUser, testDate, null, null);
            assert.isOk(session3);
        });

        before('Invite the users to their sessions', async function () {
            this.timeout(10000);
            let invitees = session1.invitees;
            invitees.push(anotherUser1.emailAddress);
            session1 = await sessionService.updateInvitees(session1._id, invitees);
            assert.isOk(session1);
            assert.isTrue(session1.invitees.includes(anotherUser1.emailAddress));

            invitees = session2.invitees;
            invitees.push(anotherUser1.emailAddress);
            session2 = await sessionService.updateInvitees(session2._id, invitees);
            assert.isOk(session2);
            assert.isTrue(session2.invitees.includes(anotherUser1.emailAddress));

            invitees = session2.invitees;
            invitees.push(anotherUser2.emailAddress);
            session2 = await sessionService.updateInvitees(session2._id, invitees);
            assert.isOk(session2);
            assert.isTrue(session2.invitees.includes(anotherUser2.emailAddress));

            invitees = session3.invitees;
            invitees.push(anotherUser2.emailAddress);
            session3 = await sessionService.updateInvitees(session3._id, invitees);
            assert.isOk(session3);
            assert.isTrue(session3.invitees.includes(anotherUser2.emailAddress));
        });

        it('Get sessions by invitee - anotherUser1', async() => {
            let sessions = await sessionService.getSessionsByInvitee(anotherUser1._id);
            assert.isOk(sessions);
            assert.isArray(sessions);
            assert.strictEqual(sessions.length, 2);
            let sessionsToTitle = sessions.map(session => session.title);
            assert.isTrue(sessionsToTitle.includes('Test session'));
            assert.isTrue(sessionsToTitle.includes('Test session 2'));
        });

        it('Get sessions by invitee - anotherUser2', async() => {
            let sessions = await sessionService.getSessionsByInvitee(anotherUser2._id);
            assert.isOk(sessions);
            assert.isArray(sessions);
            assert.strictEqual(sessions.length, 2);
            let sessionsToTitle = sessions.map(session => session.title);
            assert.isTrue(sessionsToTitle.includes('Test session 2'));
            assert.isTrue(sessionsToTitle.includes('Test session 3'));
        });

        after('Remove the users', async () => {
            let successful = await userService.removeUser(anotherUser1._id);
            assert.isTrue(successful);
            successful = await userService.removeUser(anotherUser2._id);
            assert.isTrue(successful);
        });

        after('Remove the sessions', async() => {
            let successful = await sessionService.removeSession(session1._id);
            assert.isTrue(successful);
            successful = await sessionService.removeSession(session2._id);
            assert.isTrue(successful);
            successful = await sessionService.removeSession(session3._id);
            assert.isTrue(successful);
        });

    });

    describe('Get sessions by participant', () => {
        let session1;
        let session2;
        let session3;
        let anotherUser1;
        let anotherUser2;

        before('Create the users', async () => {
            anotherUser1 = await userService.addUser('blem', 'Kalob', 'blemkalob@iets.be', null, 'blemkalbo');
            assert.isOk(anotherUser1);
            anotherUser2 = await userService.addUser('Jonas', 'Verlanders', 'jonasVerlanders@teamjs.be', null, 'jonas123');
            assert.isOk(anotherUser2);
        });

        before('Create the sessions', async () => {
            session1 = await sessionService.addSession('Test session', 'test session creation', 'opportunity', 3, 5, [],
                true, false, [testUser, anotherUser1], testTheme, testUser, testDate, null, null);
            assert.isOk(session1);

            session2 = await sessionService.addSession('Test session 2', 'test session creation', 'opportunity', 3, 5, [],
                true, false, [testUser, anotherUser1, anotherUser2], testTheme, testUser, testDate, null, null);
            assert.isOk(session2);

            session3 = await sessionService.addSession('Test session 3', 'test session creation', 'opportunity', 3, 5, [],
                true, false, [testUser, anotherUser2], testTheme, testUser, testDate, null, null);
            assert.isOk(session3);
        });

        it('Get sessions by participant - anotherUser1', async() => {
            let sessions = await sessionService.getSessionsByParticipant(anotherUser1._id);
            assert.isOk(sessions);
            assert.isArray(sessions);
            assert.strictEqual(sessions.length, 2);
            let sessionsToTitle = sessions.map(session => session.title);
            assert.isTrue(sessionsToTitle.includes('Test session'));
            assert.isTrue(sessionsToTitle.includes('Test session 2'));
        });

        it('Get sessions by participant - anotherUser2', async() => {
            let sessions = await sessionService.getSessionsByParticipant(anotherUser2._id);
            assert.isOk(sessions);
            assert.isArray(sessions);
            assert.strictEqual(sessions.length, 2);
            let sessionsToTitle = sessions.map(session => session.title);
            assert.isTrue(sessionsToTitle.includes('Test session 2'));
            assert.isTrue(sessionsToTitle.includes('Test session 3'));
        });

        after('Remove the users', async () => {
            let successful = await userService.removeUser(anotherUser1._id);
            assert.isTrue(successful);
            successful = await userService.removeUser(anotherUser2._id);
            assert.isTrue(successful);
        });

        after('Remove the sessions', async() => {
            let successful = await sessionService.removeSession(session1._id);
            assert.isTrue(successful);
            successful = await sessionService.removeSession(session2._id);
            assert.isTrue(successful);
            successful = await sessionService.removeSession(session3._id);
            assert.isTrue(successful);
        });
    });

    describe('Update a session', function () {
        let session;
        let anotherUser;
        before('Create a session', async() => {
            session = await sessionService.addSession('Test session', 'test session creation', 'opportunity', 3, 5, [],
                true, false, [testUser], testTheme, testUser, null, null, null);
            assert.isOk(session);

            anotherUser = await userService.addUser('blem', 'Kalob', 'blemkalob@iets.be', null, 'blemkalbo');
            assert.isOk(anotherUser);
        });

        it('Invite a user to a session - invitees check', async() => {
            let invitees = session.invitees;
            invitees.push('test@test.com');
            let newSession = await sessionService.updateInvitees(session._id, invitees);
            assert.isOk(newSession);
            assert.isTrue(newSession.invitees.includes('test@test.com'));
            session = newSession;
        });

        it('Invite a user to a session - unable to invite an already participating person', async() => {
            let invitees = session.invitees;
            invitees.push(testUser.emailAddress);
            try {
                let newSession = await sessionService.updateInvitees(session._id, invitees);
                assert.isNotOk(newSession);
            } catch (err) {
                assert.isOk(err);
                assert.strictEqual(err.message, testUser.emailAddress + ' is already a participant of this session');
            }
        });

        it('Update various fields of a session', async() => {
            let updates = {
                title: 'Test session title update',
                description: 'a fun description',
                maxCardsPerParticipant: 10
            };
            let newSession = await sessionService.changeSession(session._id, updates);
            assert.isOk(newSession);
            assert.strictEqual(newSession.title, 'Test session title update');
            assert.strictEqual(newSession.description, 'a fun description');
            assert.strictEqual(newSession.maxCardsPerParticipant, 10);
            assert.strictEqual(newSession.circleType, session.circleType);
            assert.strictEqual(newSession.minCardsPerParticipant, session.minCardsPerParticipant);
            assert.strictEqual(newSession.cardsCanBeAdded, session.cardsCanBeAdded);
            assert.strictEqual(newSession.cardsCanBeReviewed, session.cardsCanBeReviewed);
            session = newSession;
        });

        after('Remove the session & user', async() => {
            let successful = await sessionService.removeSession(session._id);
            assert.isTrue(successful);
            successful = await userService.removeUser(anotherUser._id);
            assert.isTrue(successful);
        });
    });

    describe('Accept an invite to a session', function () {
        let session;
        let anotherUser;
        before('Create a session', async() => {
            session = await sessionService.addSession('Test session', 'test session creation', 'opportunity', 3, 5, [],
                true, false, [testUser], testTheme, testUser, null, null, null);
            assert.isOk(session);

            anotherUser = await userService.addUser('blem', 'Kalob', 'blemkalob@iets.be', null, 'blemkalbo');
            assert.isOk(anotherUser);
        });

        before('Invite anotherUser to the session', async() => {
            let invitees = session.invitees;
            invitees.push(anotherUser.emailAddress);
            let newSession = await sessionService.updateInvitees(session._id, invitees);
            assert.isOk(newSession);
            assert.isTrue(newSession.invitees.includes(anotherUser.emailAddress));
            session = newSession;
        });

        it('Accept invite to a session', async() => {
            let newSession = await sessionService.acceptInviteToSession(session._id, anotherUser._id);
            assert.isOk(newSession);
            assert.isTrue(newSession.participants.map(user => user._id.toString()).includes(anotherUser._id.toString()));
        });

        after('Remove the session & user', async() => {
            let successful = await sessionService.removeSession(session._id);
            assert.isTrue(successful);
            successful = await userService.removeUser(anotherUser._id);
            assert.isTrue(successful);
        });
    });

    describe('Pick cards for a session', function () {
        let session;
        let cards = [];
        before('Create a session with multiple cards', async function () {
            this.timeout(15000);
            session = await sessionService.addSession('Test session', 'test session creation', 'opportunity', 3, 5, [],
                true, false, [testUser], testTheme, testUser, null, null, null);
            assert.isOk(session);

            cards.push(await cardService.addCard("first card", testTheme._id));
            cards.push(await cardService.addCard("second card", testTheme._id));
            cards.push(await cardService.addCard("third card", testTheme._id));
            cards.push(await cardService.addCard("fourth card", testTheme._id));
            cards.push(await cardService.addCard("fifth card", testTheme._id));
            cards.push(await cardService.addCard("sixth card", testTheme._id));

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

        it('let user pick cards for a session', async() => {
            let userCards = cards.slice(0, 4);
            let pickedCards = await sessionService.pickCards(session._id, testUser._id, userCards);
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

        it('get picked cards from user', async() => {
            let userCards = cards.slice(0, 4);
            let pickedCards = await sessionService.getPickedCardsByUser(session._id, testUser._id);
            // console.log('get picked cards service tests');
            // console.log(pickedCards);
            // console.log('');
            assert.isOk(pickedCards);
            let userCardsAsStrings = userCards.map(card => card._id.toString());
            let pickedCardsAsStrings = pickedCards.cards.map(pickedCard => pickedCard._id.toString());
            assert.strictEqual(userCardsAsStrings.length, pickedCardsAsStrings.length);
            assert.strictEqual(pickedCards.cards.length, 4);
            assert.isTrue(pickedCardsAsStrings.includes(userCardsAsStrings[0]));
            assert.isTrue(pickedCardsAsStrings.includes(userCardsAsStrings[1]));
            assert.isTrue(pickedCardsAsStrings.includes(userCardsAsStrings[2]));
            assert.isTrue(pickedCardsAsStrings.includes(userCardsAsStrings[3]));
        });

        after('Remove the session and the cards', async() => {
            let successful = await sessionService.removeSession(session._id);
            assert.isTrue(successful);
            cards.forEach(async function (card) {
                let successful = await cardService.removeCard(card._id);
                assert.isTrue(successful);
            });
        });
    });

    describe('Pick cards for a session multiple times', function () {
        let session;
        let cards = [];
        before('Create a session with multiple cards', async function () {
            this.timeout(15000);
            session = await sessionService.addSession('Test session', 'test session creation', 'opportunity', 1, 6, [],
                true, false, [testUser], testTheme, testUser, null, null, null);
            assert.isOk(session);

            cards.push(await cardService.addCard("first card", testTheme._id));
            cards.push(await cardService.addCard("second card", testTheme._id));
            cards.push(await cardService.addCard("third card", testTheme._id));
            cards.push(await cardService.addCard("fourth card", testTheme._id));
            cards.push(await cardService.addCard("fifth card", testTheme._id));
            cards.push(await cardService.addCard("sixth card", testTheme._id));

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

        it('let user pick cards for a session - first time picking', async() => {
            let userCards = cards.slice(0, 2);
            let pickedCards = await sessionService.pickCards(session._id, testUser._id, userCards);
            assert.isOk(pickedCards);
            assert.isArray(pickedCards.cards);
            let userCardsAsStrings = userCards.map(card => card._id.toString());
            let pickedCardsAsStrings = pickedCards.cards.map(pickedCard => pickedCard.toString());
            assert.strictEqual(userCardsAsStrings.length, pickedCardsAsStrings.length);
            assert.strictEqual(pickedCards.cards.length, 2);
            assert.isTrue(pickedCardsAsStrings.includes(userCardsAsStrings[0]));
            assert.isTrue(pickedCardsAsStrings.includes(userCardsAsStrings[1]));
        });

        it('let user pick cards for a session - second time picking - update cards', async() => {
            let userCards = cards.slice(2, 4);
            let pickedCards = await sessionService.pickCards(session._id, testUser._id, userCards);
            assert.isOk(pickedCards);
            assert.isArray(pickedCards.cards);
            let userCardsAsStrings = userCards.map(card => card._id.toString());
            let pickedCardsAsStrings = pickedCards.cards.map(pickedCard => pickedCard.toString());
            assert.strictEqual(userCardsAsStrings.length, pickedCardsAsStrings.length);
            assert.strictEqual(pickedCards.cards.length, 2);
            assert.isTrue(pickedCardsAsStrings.includes(userCardsAsStrings[0]));
            assert.isTrue(pickedCardsAsStrings.includes(userCardsAsStrings[1]));
        });

        it('get picked cards from user - should be equal to third picking', async() => {
            let userCards = cards.slice(2,4);
            let pickedCards = await sessionService.getPickedCardsByUser(session._id, testUser._id);
            assert.isOk(pickedCards);
            let userCardsAsStrings = userCards.map(card => card._id.toString());
            let pickedCardsAsStrings = pickedCards.cards.map(pickedCard => pickedCard._id.toString());
            assert.strictEqual(userCardsAsStrings.length, pickedCardsAsStrings.length);
            assert.strictEqual(pickedCards.cards.length, 2);
            assert.isTrue(pickedCardsAsStrings.includes(userCardsAsStrings[0]));
            assert.isTrue(pickedCardsAsStrings.includes(userCardsAsStrings[1]));
        });

        after('Remove the session and the cards', async() => {
            let successful = await sessionService.removeSession(session._id);
            assert.isTrue(successful);
            cards.forEach(async function (card) {
                let successful = await cardService.removeCard(card._id);
                assert.isTrue(successful);
            });
        });
    });

    describe('Start session', function () {
        let session;
        let anotherUser;
        before('Create a session and another user', async() => {
            session = await sessionService.addSession('Test session', 'test session creation', 'opportunity', 3, 5, [],
                true, false, [testUser], testTheme, testUser, testDate, null, null);
            assert.isOk(session);

            anotherUser = await userService.addUser('Joren', 'Herksens', 'joren.herksens@teamjs.xyz', 'Karel de Grote Hogeschool - TeamJS', 'myAwesomePassword.123');
            assert.isOk(testUser);
        });

        it('Unable to pause the created session', async() => {
            try{
                let newSession = await sessionService.pauseSession(session._id, testUser._id);
                assert.isNotOk(newSession);
            }catch(err){
                assert.isOk(err);
                assert.strictEqual(err.message, 'Unable to pause a not yet started session');
            }
        });

        it('Start the created session', async() => {
            let newSession = await sessionService.startSession(session._id, testUser._id);
            assert.isOk(newSession);
            assert.strictEqual(newSession.status, 'started');
            // assert.strictEqual(newSession.events.length, 2);
            // assert.isTrue(newSession.events.includes(event => event.eventType === 'start'));
        });

        it('Start the created session - not an organiser', async() => {
            try{
                let newSession = await sessionService.startSession(session._id, anotherUser._id);
                assert.isNotOk(newSession);
            }catch(err){
                assert.isOk(err);
                assert.strictEqual(err.message, 'User is not an organiser of this session');
            }
        });

        it('Start the created session - already started', async() => {
            try{
                let newSession = await sessionService.startSession(session._id, testUser._id);
                assert.isNotOk(newSession);
            }catch(err){
                assert.isOk(err);
                assert.strictEqual(err.message, 'Unable to start an already started/finished session');
            }
        });

        after('Remove the session and user', async() => {
            let successful = await sessionService.removeSession(session._id);
            assert.isTrue(successful);

            successful = await userService.removeUser(anotherUser._id);
            assert.isTrue(successful);
        });
    });

    describe('Pause session', function () {
        let session;
        before('Create a session', async() => {
            session = await sessionService.addSession('Test session', 'test session creation', 'opportunity', 3, 5, [],
                true, false, [testUser], testTheme, testUser, testDate, null, null);
            assert.isOk(session);
        });

        before('Start the created session', async() => {
            let newSession = await sessionService.startSession(session._id, testUser._id);
            assert.isOk(newSession);
            assert.strictEqual(newSession.status, 'started');
            // assert.strictEqual(newSession.events.length, 2);
            // assert.isTrue(newSession.events.includes(event => event.eventType === 'start'));
        });

        it('Pause the started session', async() => {
            let newSession = await sessionService.pauseSession(session._id, testUser._id);
            assert.isOk(newSession);
            assert.strictEqual(newSession.status, 'paused');
        });

        it('Unpause the paused session', async() => {
            let newSession = await sessionService.pauseSession(session._id, testUser._id);
            assert.isOk(newSession);
            assert.strictEqual(newSession.status, 'started');
        });

        after('Remove the session', async() => {
            let successful = await sessionService.removeSession(session._id);
            assert.isTrue(successful);
        });
    });

    describe('Stop session', function () {
        let session;
        before('Create a session', async() => {
            session = await sessionService.addSession('Test session', 'test session creation', 'opportunity', 3, 5, [],
                true, false, [testUser], testTheme, testUser, testDate, null, null);
            assert.isOk(session);
        });

        before('Start the created session', async() => {
            let newSession = await sessionService.startSession(session._id, testUser._id);
            assert.isOk(newSession);
            assert.strictEqual(newSession.status, 'started');
            // assert.strictEqual(newSession.events.length, 2);
            // assert.isTrue(newSession.events.includes(event => event.eventType === 'start'));
        });

        it('Stop the started session', async() => {
            let newSession = await sessionService.stopSession(session._id, testUser._id);
            assert.isOk(newSession);
            assert.strictEqual(newSession.status, 'finished');
        });

        it('Unable to start the stopped session', async() => {
            try{
                let newSession = await sessionService.startSession(session._id, testUser._id);
                assert.isNotOk(newSession);
            }catch(err){
                assert.isOk(err);
                assert.strictEqual(err.message, 'Unable to start an already started/finished session');
            }
        });

        it('Unable to pause the stopped session', async() => {
            try{
                let newSession = await sessionService.pauseSession(session._id, testUser._id);
                assert.isNotOk(newSession);
            }catch(err){
                assert.isOk(err);
                assert.strictEqual(err.message, 'Unable to pause an already finished session');
            }
        });

        after('Remove the session', async() => {
            let successful = await sessionService.removeSession(session._id);
            assert.isTrue(successful);
        });
    });

    describe('Add a card to a session', function () {

    });

    describe('Test playing the game', function () {
        let session;
        let cards = [];
        let anotherUser;

        before('Create anotherUser and session of which both anotherUser and testUser are a participant', async() => {
            anotherUser = await userService.addUser('blem', 'Kalob', 'blemkalob@iets.be', null, 'blemkalbo');
            assert.isOk(anotherUser);

            session = await sessionService.addSession('Test session', 'test session creation', 'opportunity', 3, 5, [],
                true, false, [testUser, anotherUser], testTheme, testUser, testDate, null, null);
            assert.isOk(session);
        });

        before('Add cards to the session', async function () {
            this.timeout(10000);
            cards.push(await cardService.addCard("first card", testTheme._id));
            cards.push(await cardService.addCard("second card", testTheme._id));
            cards.push(await cardService.addCard("third card", testTheme._id));
            cards.push(await cardService.addCard("fourth card", testTheme._id));
            cards.push(await cardService.addCard("fifth card", testTheme._id));
            cards.push(await cardService.addCard("sixth card", testTheme._id));

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
            // console.log('UserID: ' + testUser._id);
            // console.log('UserCards:');
            // console.log(userCards.map(card => card._id));
            let pickedCards = await sessionService.pickCards(session._id, testUser._id, userCards);
            assert.isOk(pickedCards);
            assert.isArray(pickedCards.cards);
            let userCardsAsStrings = userCards.map(card => card._id.toString());
            // console.log('UserCardsAsStrings:');
            // console.log(userCardsAsStrings);
            let pickedCardsAsStrings = pickedCards.cards.map(pickedCard => pickedCard.toString());
            // console.log('PickedCardsAsStrings:');
            // console.log(pickedCardsAsStrings);
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
            let newSession = await sessionService.startSession(session._id, testUser._id);
            assert.isOk(newSession);
            assert.strictEqual(newSession.status, 'started');
            assert.strictEqual(newSession.cardPriorities.length, 6);

            let cardPrioritiesAsStrings = newSession.cardPriorities.map(cardPriority => cardPriority.card.toString());
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

        it('Play a turn', async() => {
            let randomCard = Math.floor((Math.random() * 5) + 0);
            let cardPriority = session.cardPriorities.find(cardPriority => cardPriority.card.toString() === cards[randomCard]._id.toString()).priority;
            assert.isTrue(session.currentUser._id.toString() === testUser._id.toString());

            let newSession = await sessionService.playTurn(session._id, testUser._id, cards[randomCard]._id);
            assert.isOk(newSession);
            assert.isTrue(newSession.currentUser._id.toString() === anotherUser._id.toString());

            let cardPriorities = newSession.cardPriorities;
            let newCardPriority = newSession.cardPriorities.find(cardPriority => cardPriority.card.toString() === cards[randomCard]._id.toString()).priority;
            assert.strictEqual(cardPriority + 1, newCardPriority);

            let sum = cardPriorities.map(cardPriority => cardPriority.priority).reduce(function (accumulated, currValue) {
                return accumulated + currValue;
            }, 0);
            assert.strictEqual(sum, 1);

            assert.strictEqual(newSession.currentUser._id.toString(),anotherUser._id.toString());

            session = newSession;
        });

        it('Play another turn', async() => {
            let randomCard = Math.floor((Math.random() * 5) + 0);
            let cardPriority = session.cardPriorities.find(cardPriority => cardPriority.card.toString() === cards[randomCard]._id.toString()).priority;
            assert.isTrue(session.currentUser._id.toString() === anotherUser._id.toString());

            let newSession = await sessionService.playTurn(session._id, anotherUser._id, cards[randomCard]._id);
            // console.log(newSession);
            assert.isOk(newSession);
            assert.isTrue(newSession.currentUser._id.toString() === testUser._id.toString());

            let cardPriorities = newSession.cardPriorities;
            let newCardPriority = newSession.cardPriorities.find(cardPriority => cardPriority.card.toString() === cards[randomCard]._id.toString()).priority;
            assert.strictEqual(cardPriority + 1, newCardPriority);

            let sum = cardPriorities.map(cardPriority => cardPriority.priority).reduce(function (accumulated, currValue) {
                return accumulated + currValue;
            }, 0);
            assert.strictEqual(sum, 2);

            assert.strictEqual(newSession.currentUser._id.toString(),testUser._id.toString());

            session = newSession;
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

    after('Remove test user & test theme', async() => {
        let successful = await userService.removeUser(testUser._id);
        assert.isTrue(successful);
        successful = await themeService.removeTheme(testTheme._id);
        assert.isTrue(successful);
    });

});