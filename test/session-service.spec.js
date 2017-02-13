/**
 * Created by steve on 2/8/2017.
 */
const chai = require('chai');
const assert = chai.assert;

const Theme = require('../models/theme');
const User = require('../models/user');
const sessionService = require('../services/session-service');

describe('Session service tests -', function () {
    let testGlobal = {};
    before('setup test theme and testuser', function () {
        let testTheme = new Theme();
        testTheme.title = 'testTheme';
        let testUser = new User();
        testUser.firstname = "testFirstName";
        let testDate = new Date(2017, 8, 2, 16, 20, 0);
        let testDate2 = new Date(2017, 9, 2, 16, 20, 0);
        testGlobal.testTheme = testTheme;
        testGlobal.testUser = testUser;
        testGlobal.testDate = testDate;
        testGlobal.testDate2 = testDate2;
    });
    describe('Creating a session:', function () {

        it('Create a session on a theme', function () {
            //title, description, circleType, roundDuration, cardsPerParticipant,cards, canReview, canAddCards, theme, creator, startDate = null)
            let session = sessionService
                .createSession('testSession', 'testing the creation of a session', 'blue',
                    60000, {min: 3, max: 10}, [], false, false, [testGlobal.testUser],
                    testGlobal.testTheme._id, testGlobal.testUser, testGlobal.testDate);
            assert(session, 'session is not null or undefined');
            assert(session.title === 'testSession', 'session title should be "testSession"');
            assert(session.description === 'testing the creation of a session', 'session description should be "testing the creation of a session"');
            assert(session.circleType === 'blue', 'session circletype should be blue');
            assert(session.turnDuration === 60000, 'duration of a round should be 60 seconds');
            assert(session.cardsPerParticipant.min === 3, 'min amount of cards to take should be 3');
            assert(session.cardsPerParticipant.max === 10, 'max amount of cards to take should be 10');
            assert(session.cardsCanBeReviewed === false, 'participants should not be able to review cards');
            assert(session.cardsCanBeAdded === false, 'participants should not be able to add cards');
            assert(session.participants.length === 1, 'there should be one participant');
            assert.strictEqual(session.participants[0]._id, testGlobal.testUser._id, 'id of the participant should be ' + testGlobal.testUser._id);
            let sessionDate = new Date(session.startDate);
            assert(sessionDate.getFullYear() === 2017 && sessionDate.getMonth() === 8
                && sessionDate.getDate() === 2 && sessionDate.getHours() === 16
                && sessionDate.getMinutes() === 20 && sessionDate.getSeconds() === 0, 'session should start at 2-8-2017 16:20:00');
            assert.strictEqual(session.theme, testGlobal.testTheme._id, 'session theme should have ' + testGlobal.testTheme._id + ' as id');
            assert.strictEqual(session.creator, testGlobal.testUser._id, 'creator of the session should have ' + testGlobal.testUser._id + ' as id');
            sessionService.deleteSession(session._id);
        });

        it('copy a session of a theme', function () {

        });
    });

    describe('Start a session:', function () {
        it('start a session instant as an organiser', function () {
            let session = sessionService
                .createSession('testSession', 'testing the creation of a session', 'blue',
                    60000, {min: 3, max: 10}, [], false, false, [testGlobal.testUser],
                    testGlobal.testTheme, testGlobal.testUser);
            var beforeDate = new Date();
            sessionService.startSession(session._id);
            assert(session.startDate !== null, 'startdate of the session should been set');
            sessionService.deleteSession(session._id);
            assert(session.startDate!==null, 'startdate of the session should been set');
            // assert(session.startDate <= beforeDate, 'startdate of the session should been set');
            // assert(session.startDate >= new Date(), 'startdate of the session should been set');
        });

        it('start a session on an specific date as an organiser', function () {
            session = sessionService
                .createSession('testSession', 'testing the creation of a session', 'blue',
                    60000, {min: 3, max: 10}, [], false, false, [testGlobal.testUser],
                    testGlobal.testTheme, testGlobal.testUser);
            sessionService.startSession(session._id, testGlobal.testDate);
            assert(session.startDate === testGlobal.testDate, 'startdate of the session should been set');
            sessionService.deleteSession(session._id);
        });
        
        it('a session can not be started if it already is started', function () {
            let session = sessionService
                .createSession('testSession', 'testing the creation of a session', 'blue',
                    60000, {min: 3, max: 10}, [], false, false, [testGlobal.testUser],
                    testGlobal.testTheme, testGlobal.testUser);
            sessionService.startSession(session._id, testGlobal.testDate2);
            assert.strictEqual(session.startDate, testGlobal.testDate, 'startdate should be equals tot testdate1');
            sessionService.startSession(session._id, testGlobal.testDate2);
            assert.strictEqual(session.startDate, testGlobal.testDate, 'startdate should be equals tot testdate1');
        })
    });

    describe('Stop a session:', function () {
        it('end a session as an organiser', function () {
            let session = sessionService
                .createSession('testSession', 'testing the creation of a session', 'blue',
                    60000, {min: 3, max: 10}, [], false, false, [testGlobal.testUser],
                    testGlobal.testTheme, testGlobal.testUser);
            sessionService.startSession(session._id);
            sessionService.stopSession(session._id);
            assert(session.endDate, 'endDate schould be defined')
        });

        it('a session can not be stopped before it was started', function () {
            let session = sessionService
                .createSession('testSession', 'testing the creation of a session', 'blue',
                    60000, {min: 3, max: 10}, [], false, false, [testGlobal.testUser],
                    testGlobal.testTheme, testGlobal.testUser);
            sessionService.stopSession(session._id);
            assert(!session.endDate, 'endDate schould not be defined')
        });
    });
});