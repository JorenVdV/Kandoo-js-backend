/**
 * Created by steve on 2/8/2017.
 */
const Session = require('../models/session');

class SessionService {
    constructor() {
        this.sessionRepo = require('../repositories/session-repository');
    }

    createSession(title, description, circleType, turnDuration, cardsPerParticipant, cards, canReviewCards, canAddCards, participants, themeId, creator, startDate = null, amountOfCircles = 5) {
        let session = new Session();
        session.title = title;
        session.description = description;
        session.circleType = circleType;
        session.turnDuration = turnDuration;
        session.cardsPerParticipant = cardsPerParticipant;
        session.amountOfCircles = amountOfCircles;
        session.cards = cards;
        session.cardsCanBeReviewed = canReviewCards;
        session.cardsCanBeAdded = canAddCards;
        session.theme = themeId;
        session.creator = creator._id;
        session.participants = participants;
        session.rounds = [];
        if (startDate)
            session.startDate = startDate;

        this.sessionRepo.createSession(session);
        return session;
    }

    getSession(sessionId) {
        return this.sessionRepo.getSessionById(sessionId)
    }

    getSessions(themeId) {
        return this.sessionRepo.getSessions(themeId);
    }

    deleteSession(sessionId) {
        this.sessionRepo.deleteSession(sessionId);
        return !this.getSession(sessionId);

    }

    startSession(sessionId, date = new Date()) {
        let session = this.getSession(sessionId);
        session.startDate = date;
        this.sessionRepo.updateSession(session);
        if (!session.startDate) {
            session.startDate = date;
            this.sessionRepo.updateSession(session)
        }
    }

    stopSession(sessionId) {
        let session = this.getSession(sessionId);
        if (session.startDate) {
            session.endDate = new Date();
            this.sessionRepo.updateSession();
        }
    }

    addTurn(sessionId, card, user) {

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
}

module.exports = new SessionService();