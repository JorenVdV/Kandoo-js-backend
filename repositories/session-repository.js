/**
 * Created by steve on 2/8/2017.
 */
const Session = require('../models/session');

class SessionRepository {
    constructor() {
        this.sessionDao = [];
    }

    createSession(title, description, circleType, roundDuration, cardsPerParticipant, theme, creator, cards) {
        let session = new Session();
        session.title = title;
        session.description = description;
        session.circleType = circleType;
        session.roundDuration = roundDuration;
        session.cardsPerParticipant = cardsPerParticipant;
        session.theme = theme;
        session.creator = creator;
        session.cards = cards;

        this.sessionDao.push(session);
        return session;
    }

    getSessionById(id) {
        return this.sessionDao.find(session => session._id == id);
    }

    updateSession() {

    }

    deleteSession(id) {
        return this.sessionDao.splice(this.sessionDao.findIndex(session => session._id === id), 1);
    }
}

module.exports = new SessionRepository();