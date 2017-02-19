/**
 * Created by steve on 2/8/2017.
 */
const config = require('../../_config');
const mongoose = require('mongoose');
process.env.NODE_ENV = 'test';

const chai = require('chai');
const assert = chai.assert;

const Theme = require('../../models/theme');
const User = require('../../models/user');
const sessionService = require('../../services/session-service');
const cardService = require('../../services/card-service');
const themeService = require('../../services/theme-service');
const userService = require('../../services/user-service');


var nodemailer = require('nodemailer');
var mockTransport = require('../../node_modules/nodemailer-mock-transport/index');

describe('Session service tests -', function () {
    before('Open connection to test database', function(done){
        if(mongoose.connection.readyState === 0){
            mongoose.connect(config.mongoURI[process.env.NODE_ENV],function(err){
                if(err){
                    console.log('Error connecting to the database. ' + err);
                } else{
                    console.log('Connected to database: ' + config.mongoURI[process.env.NODE_ENV]);
                }
                done();
            });
        }else {
            console.log("Already connected to mongodb://" + mongoose.connection.host + ":" + mongoose.connection.port + "/" + mongoose.connection.name);
            done();
        }
    });

    let testGlobal = {};
    before('setup test theme and testuser with card in that theme', function () {
        let testTheme = new Theme();
        testTheme.title = 'testTheme';
        let testUser = new User();
        testUser.firstname = "testFirstName";
        let testDate = new Date(2017, 8, 2, 16, 20, 0);
        let testDate2 = new Date(2017, 9, 2, 16, 20, 0);
        let card = cardService.addCard("This is a test");
        testTheme = themeService.addTheme(testTheme, "asf", [], true, testUser);
        themeService.addCard(testTheme._id, card);
        testGlobal.testTheme = testTheme;
        testGlobal.testUser = testUser;
        testGlobal.testDate = testDate;
        testGlobal.testDate2 = testDate2;
        testGlobal.card = card;
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

        // it('copy a session of a theme', function () {
        //
        // });
    });

    describe('Start a session:', function () {
        it('start a session instance as an organiser', function () {
            let session = sessionService
                .createSession('testSession', 'testing the creation of a session', 'blue',
                    60000, {min: 3, max: 10}, [], false, false, [testGlobal.testUser],
                    testGlobal.testTheme, testGlobal.testUser);
            var beforeDate = new Date();
            sessionService.startSession(session._id);
            assert(session.startDate !== null, 'startdate of the session should been set');
            sessionService.deleteSession(session._id);
            assert(session.startDate !== null, 'startdate of the session should been set');
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
            sessionService.startSession(session._id, testGlobal.testDate);
            assert.strictEqual(session.startDate, testGlobal.testDate, 'startdate should be equals tot testdate1');
            sessionService.startSession(session._id, testGlobal.testDate2);
            assert.strictEqual(session.startDate, testGlobal.testDate2, 'startdate should be equals tot testdate2');
        })
    });

    describe('play a turn', function () {
        it('should add a turn to the session with a card and it\'s priority', function () {

            let session = sessionService
                .createSession('testSession', 'testing the creation of a session', 'blue',
                    60000, {min: 3, max: 10}, [], false, false, [testGlobal.testUser],
                    testGlobal.testTheme._id, testGlobal.testUser, testGlobal.testDate);

            sessionService.addTurn(session._id, testGlobal.card, testGlobal.testUser);


            assert.strictEqual(session.turns[0].card._id, testGlobal.card._id, 'The cards should be the same');
            assert.strictEqual(session.turns[0].priority, session.amountOfCircles - 1, 'The card should be 1 step closer to the middle');
            assert.strictEqual(session.turns[0].user._id, testGlobal.testUser._id, 'The user of the turn should be our user');
        });
    });

    describe('Stop a session:', function () {
        it('ends a session as an organiser', function () {
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
    describe('Invite a user', function () {
        var session;
        before('setup 2 users and a session', function () {
            session = sessionService
                .createSession('testSession', 'testing the creation of a session', 'blue',
                    60000, {min: 3, max: 10}, [], false, false, [testGlobal.testUser],
                    testGlobal.testTheme, testGlobal.testUser);
            sessionService.startSession(session._id);
            sessionService.stopSession(session._id);
            assert(session.endDate, 'endDate should be defined');


            testGlobal.testUser2 = userService.createUser('this is a test', 'testubg', 'nickjorens@gmail.com', 'd', 'test');
        });

        it('invites an existing user to a session', function () {
            sessionService.invite(session._id, testGlobal.testUser2._id);

            assert.equal(session.invitees[0], testGlobal.testUser2._id, 'Session invitees list should contain id from testuser2');
        });

        it('it should have 2 emails from inviting users.', function () {
            let mailService = require('../../services/mail-service');


            mailService.getTransporter().sentMail.length.should.equal(2);

        });

        after(function () {
            userService.removeUser(testGlobal.testUser2._id);
        })


    });

    after('Closing connection to test database', function(done){
        mongoose.disconnect();
        done();
    });
});