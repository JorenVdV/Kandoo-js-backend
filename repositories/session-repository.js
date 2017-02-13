/**
 * Created by steve on 2/8/2017.
 */
class SessionRepository {
    constructor() {
        this.sessionDao = [];
    }

    createSession(session) {
        this.sessionDao.push(session);
        return session;
    }

    getSessionById(id) {
        return this.sessionDao.find(session => session._id == id);
    }

    updateSession(session) {

    }

    deleteSession(id) {
        return this.sessionDao.splice(this.sessionDao.findIndex(session => session._id === id), 1);
    }
}

module.exports = new SessionRepository();