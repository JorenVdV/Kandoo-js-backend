/**
 * Created by steve on 2/8/2017.
 */
const Session = require('../models/session');

class SessionService {
    constructor(){
        this.repo = require('../repositories/session-repository');
    }

    createSession(title, description, circleType, roundDuration, cardsPerParticipant,cards, canReview, canAddCards, participants,theme, creator, startDate = null){
        let session = new Session();
        session.title = title;
        session.description = description;
        session.circleType = circleType;
        session.roundDuration = roundDuration;
        session.cardsPerParticipant = cardsPerParticipant;
        session.cards = cards;
        session.canReview = canReview;
        session.canAddCards = canAddCards;
        session.theme = theme._id;
        session.creator = creator._id;
        session.participants = participants;
        if(startDate)
            session.startDate = startDate;

        this.repo.createSession(session);
        return session;
    }

}

module.exports = new SessionService();