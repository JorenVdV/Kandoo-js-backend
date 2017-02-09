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

}

module.exports = new SessionService();