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
    before('setup test user', function(done){
        userService.createUser('test', 'Testi', 'test.Testi@teamjs.xyz', 'Karel de Grote Hogeschool - TeamJS', 'myAwesomePassword.123', function (user, err) {
            assert.isNotOk(err);
            assert.isOk(user);
            testGlobal.testUser = user;
            done();
        });
    });

    before('setup test theme and testuser with card in that theme', function () {
        let testTheme = new Theme();
        testTheme.title = 'testTheme';
        let testDate = new Date(2017, 8, 2, 16, 20, 0);
        let testDate2 = new Date(2017, 9, 2, 16, 20, 0);
        let card = cardService.addCard("This is a test");
        testTheme = themeService.addTheme(testTheme, "asf", [], true, testGlobal.testUser);
        themeService.addCard(testTheme._id, card);
        testGlobal.testTheme = testTheme;
        testGlobal.testDate = testDate;
        testGlobal.testDate2 = testDate2;
        testGlobal.card = card;
    });

    describe('Creating a session:', function () {

        it('Create a session on a theme', function (done) {
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
            done();
        });

        // it('copy a session of a theme', function () {
        //
        // });
    });

    describe('Start a session:', function () {
        it('start a session instance as an organiser', function (done) {
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
            done();
        });

        it('start a session on an specific date as an organiser', function (done) {
            session = sessionService
                .createSession('testSession', 'testing the creation of a session', 'blue',
                    60000, {min: 3, max: 10}, [], false, false, [testGlobal.testUser],
                    testGlobal.testTheme, testGlobal.testUser);
            sessionService.startSession(session._id, testGlobal.testDate);
            assert(session.startDate === testGlobal.testDate, 'startdate of the session should been set');
            sessionService.deleteSession(session._id);
            done();
        });

        it('a session can not be started if it already is started', function (done) {
            let session = sessionService
                .createSession('testSession', 'testing the creation of a session', 'blue',
                    60000, {min: 3, max: 10}, [], false, false, [testGlobal.testUser],
                    testGlobal.testTheme, testGlobal.testUser);
            sessionService.startSession(session._id, testGlobal.testDate);
            assert.strictEqual(session.startDate, testGlobal.testDate, 'startdate should be equals tot testdate1');
            sessionService.startSession(session._id, testGlobal.testDate2);
            assert.strictEqual(session.startDate, testGlobal.testDate2, 'startdate should be equals tot testdate2');
            done();
        })
    });

    describe('play a turn', function () {
        it('should add a turn to the session with a card and it\'s priority', function (done) {

            let session = sessionService
                .createSession('testSession', 'testing the creation of a session', 'blue',
                    60000, {min: 3, max: 10}, [], false, false, [testGlobal.testUser],
                    testGlobal.testTheme._id, testGlobal.testUser, testGlobal.testDate);

            sessionService.addTurn(session._id, testGlobal.card, testGlobal.testUser);


            assert.strictEqual(session.turns[0].card._id, testGlobal.card._id, 'The cards should be the same');
            assert.strictEqual(session.turns[0].priority, session.amountOfCircles - 1, 'The card should be 1 step closer to the middle');
            assert.strictEqual(session.turns[0].user._id, testGlobal.testUser._id, 'The user of the turn should be our user');
            done();
        });
    });

    describe('Stop a session:', function () {
        it('ends a session as an organiser', function (done) {
            let session = sessionService
                .createSession('testSession', 'testing the creation of a session', 'blue',
                    60000, {min: 3, max: 10}, [], false, false, [testGlobal.testUser],
                    testGlobal.testTheme, testGlobal.testUser);
            sessionService.startSession(session._id);
            sessionService.stopSession(session._id);
            assert(session.endDate, 'endDate schould be defined');
            done();
        });

        it('a session can not be stopped before it was started', function (done) {
            let session = sessionService
                .createSession('testSession', 'testing the creation of a session', 'blue',
                    60000, {min: 3, max: 10}, [], false, false, [testGlobal.testUser],
                    testGlobal.testTheme, testGlobal.testUser);
            sessionService.stopSession(session._id);
            assert(!session.endDate, 'endDate schould not be defined');
            done();
        });
    });

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

    after('Remove the test user', function (done) {
        userService.removeUser(testGlobal.testUser._id, function (succes, err) {
            assert.isNotOk(err);
            assert.isTrue(succes, 'user should have succesfully been deleted');
            done();
        })
    });

    after('Closing connection to test database', function(done){
        mongoose.disconnect();
        done();
    });
});