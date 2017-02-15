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

    getSessions(themeId){
        let sessions = this.sessionDao.filter(sessions => sessions.theme == themeId);
        if(sessions)
            return sessions;
        else
            return [];
    }

    updateSession(session) {

    }

    deleteSession(id) {
        this.sessionDao.splice(this.sessionDao.findIndex(session => session._id === id), 1);
    }
}

module.exports = new SessionRepository();