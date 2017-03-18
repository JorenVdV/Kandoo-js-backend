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

    async readSessionById(id, withTheme) {
        // console.log('picked cards ophalen adhv userid');
        let session;
        try {
            let query = this.sessionDao.findOne({_id: id}).populate('participants', '_id firstname lastname emailAddress').populate('currentUser', '_id firstname lastname').populate('sessionCards').populate('theme', 'organisers').populate('cardPriorities', 'card priority circlePosition').populate('cardPriorities.card');
            if(withTheme)
                query = query.populate('theme');
            session = await query.exec();//this.sessionDao.findOne({_id: id}).populate('participants', '_id firstname lastname emailAddress');
        } catch (err) {
            throw new Error('Unexpected error occurred. ' + err);
        }
        if (session) {
            return session;
        } else {
            throw new Error('Unable to find session with id: ' + id);
        }
    }
    async readSessionsByTheme(themeId) {
        let query = {theme: themeId};
        return await this.readSessions(query);
    }

    async readSessionsByInvitee(inviteeEmail) {
        let query = {invitees: {$in: [inviteeEmail]}};
        return await this.readSessions(query);
    }

    async readSessionsByParticipant(participantId) {
        let query = {participants: {$in: [participantId]}};
        return await this.readSessions(query);
    }

    async readPickedCardsByUser(sessionId, userId){
        let cards;
        try{
            let query = this.sessionDao.findOne({_id:sessionId}).populate('pickedCards').populate('currentUser', '_id firstname lastname').populate('pickedCards.cards');
            cards = await query.exec();
        } catch(err){
            throw new Error('Unexpected error occurred. ' + err);
        }

        return cards.pickedCards.find(pc => pc.userId.toString() == userId.toString());
    }

    async readSessionEvents(sessionId){
        let session;
        try{
            session = await this.sessionDao.findOne({_id:sessionId}, 'events');
        } catch(err){
            throw new Error('Unexpected error occurred. ' + err);
        }

        return session.events;
    }

    async readSessions(query) {
        let sessions;
        try {
            sessions = await this.sessionDao.find(query).populate('participants', '_id firstname lastname emailAddress').populate('sessionCards').populate('currentUser', '_id firstname lastname').populate('theme', 'organisers').populate('cardPriorities', 'card priority circlePosition').populate('cardPriorities.card');
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
            session = await this.sessionDao.findByIdAndUpdate(sessionId, toUpdate, {new:true}).populate('currentUser', '_id firstname lastname').populate('participants', '_id firstname lastname emailAddress').populate('cardPriorities', 'card priority circlePosition').populate('cardPriorities.card').populate('pickedCards sessionCards').populate('theme', 'organisers');
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