/**
 * Created by steve on 2/8/2017.
 */
const Session = require('../models/session');

class SessionService {
    constructor() {
        this.sessionRepo = require('../repositories/session-repository');
        this.userService = require('../services/user-service');
    }

    async addSession(title, description, circleType, minCardsPerParticipant, maxCardsPerParticipant, cards, canReviewCards, canAddCards,
                     participants, themeId, creator, startDate, amountOfCircles, turnDuration) {
        if (circleType != 'opportunity' && circleType != 'threat')
            throw new Error('Invalid circle type. Circle type should be "opportunity" or "threat".');
        else {
            let session = new Session();
            session.title = title;
            session.description = description;
            session.circleType = circleType;
            session.turnDuration = turnDuration ? turnDuration : 60000;
            session.minCardsPerParticipant = minCardsPerParticipant;
            session.maxCardsPerParticipant = maxCardsPerParticipant;
            session.amountOfCircles = amountOfCircles ? amountOfCircles : 5;
            session.cards = cards;
            session.cardsCanBeReviewed = canReviewCards;
            session.cardsCanBeAdded = canAddCards;
            session.theme = themeId;
            session.creator = creator._id;
            session.participants = participants;
            session.rounds = [];
            session.startDate = startDate ? startDate : null;

            return await this.sessionRepo.createSession(session);
        }
    }

    async getSession(sessionId) {
        return await this.sessionRepo.readSessionById(sessionId);
    }

    async getSessionsByTheme(themeId) {
        return await this.sessionRepo.readSessionsByTheme(themeId);
    }

    async getSessionsByInvitee(inviteeId){
        return await this.sessionRepo.readSessionsByInvitee(inviteeId);
    }

    async getSessionsByParticipant(participantId){
        return await this.sessionRepo.readSessionsByParticipant(participantId);
    }

    async removeSession(sessionId) {
        let session = await this.getSession(sessionId);
        return await this.sessionRepo.deleteSession(session);
    }

    async startSession(sessionId, callback) {
        this.getSession(sessionId, function (session, err, sessionRepo) {
            if (err)
                callback(false, err);
            if (!session.startDate || session.startDate >= new Date()) {
                session.startDate = new Date();
                sessionRepo.updateSession(session,
                    (success, err) => {
                        if (err) {
                            callback(false, err);
                        } else {
                            callback(true, err);
                        }
                    });
            }
        });

        this.sessionRepo.updateSession(sessionId)
    }

    async changeSession(sessionId, toUpdate, callback) {
        this.sessionRepo.updateSession(sessionId, toUpdate,
            (success, err) => {
                if (err)
                    callback(success, err);
                else callback(success);
            })
    }

    async stopSession(sessionId, callback) {
        let session = this.getSession(sessionId);
        if (session.startDate) {
            session.endDate = new Date();
            this.sessionRepo.updateSession();
        }
        return session.endDate;
    }

    async addTurn(sessionId, card, user, callback) {

        let session = this.getSession(sessionId);

        let turns = session.turns;
        let currentCardPriority = session.amountOfCircles - 1;
        let stopSearch = false;

        turns.reverse().forEach(function (turn) {
            if (stopSearch)
                return;


            if (turn.card.card._id == card._id) {
                currentCardPriority = turn.priority;
                stopSearch = true;
            }
        });

        session.turns.push({priority: currentCardPriority, card: card, user: user});

        return true;
    }

    async invite(sessionId, userId, callback) {
        let session = this.getSession(sessionId);
        this.userService.findUserById(userId, function (user, err) {

            session.invitees.push(user);
            console.log(session.invitees);

            let mailService = require('./mail-service');
            mailService.sendMail();

            return true;
        });

    }
}

module.exports = new SessionService();