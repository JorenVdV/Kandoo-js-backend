/**
 * Created by steve on 2/8/2017.
 */
const Session = require('../models/session');

class SessionService {
    constructor(){
        this.repo = require('../repositories/session-repository');
    }

    createSession(title, description, circleType, turnDuration, cardsPerParticipant,cards, canReviewCards, canAddCards, participants,theme, creator, startDate = null){
        let session = new Session();
        session.title = title;
        session.description = description;
        session.circleType = circleType;
        session.turnDuration = turnDuration;
        session.cardsPerParticipant = cardsPerParticipant;
        session.cards = cards;
        session.cardsCanBeReviewed = canReviewCards;
        session.cardsCanBeAdded = canAddCards;
        session.theme = theme._id;
        session.creator = creator._id;
        session.participants = participants;
        session.rounds = [];
        if(startDate)
            session.startDate = startDate;

        this.repo.createSession(session);
        return session;
    }
    
    getSession(sessionId){
        return this.repo.getSessionById(sessionId)
    }

    startSession(sessionId, date = new Date()){
        let session = this.getSession(sessionId);
        if(!session.startDate){
            session.startDate = date;
            this.repo.updateSession(session)
        }
    }

    stopSession(sessionId){
        let session = this.getSession(sessionId);
        if(session.startDate){
            session.endDate = new Date();
            this.repo.updateSession();
        }
    }
}

module.exports = new SessionService();