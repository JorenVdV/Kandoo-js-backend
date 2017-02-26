/**
 * Created by steve on 2/8/2017.
 */
const Session = require('../models/session');

class SessionRepository {
    constructor() {
        this.sessionDao = Session;
    }

    async createSession(session) {
        try {
            await session.save();
        } catch (err) {
            throw new Error('Unexpected error occurred. ' + err);
        }
        return session;
    }

    async readSessionById(id) {
        let session;
        try {
            session = await this.sessionDao.findOne({_id: id});
        } catch (err) {
            throw new Error('Unexpected error occurred. ' + err);
        }
        if(session){
            return session;
        } else{
            throw new Error('Unable to find session with id: ' + id);
        }
    }

    async readSessionsByTheme(themeId) {
        let query = {theme: themeId};
        return await this.readSessions(query);
    }

    async readSessionsByInvitee(inviteeId) {
        let query = {invitees: {$in: [inviteeId]}};
        return await this.readSessions(query);
    }

    async readSessionsByParticipant(participantId){
        let query = {participants: {$in: [participantId]}};
        return await this.readSessions(query);
    }

    async readSessions(query){
        let sessions;
        try {
            sessions = await this.sessionDao.find(query);
        } catch (err) {
            throw new Error('Unexpected error occurred. ' + err);
        }

        let sessionArray = [];
        sessions.forEach((session) => {
            sessionArray.push(session);
        });
        return sessionArray;
    }

    async updateSession(sessionId, toUpdate) {
        let session;
        try {
            session = await this.sessionDao.findByIdAndUpdate(sessionId, toUpdate);
        } catch (err) {
            throw new Error('Unexpected error occurred. ' + err);
        }
        return session;
    }

    async deleteSession(session) {
        try {
            await session.remove();
        } catch (err) {
            throw new Error('Unexpected error occurred. ' + err);
        }
        return true;
    }
}

module.exports = new SessionRepository();