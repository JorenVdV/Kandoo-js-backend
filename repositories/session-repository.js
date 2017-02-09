/**
 * Created by steve on 2/8/2017.
 */
class SessionRepository {
    constructor() {
        this.sessionDao = [];
    }

    createSession(session) {
        console.log('createSession - creator:');
        console.log(session.creator);
        console.log('createSession - session:');
        console.log(session._id);
        console.log('createSession - session:');
        console.log(session);

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