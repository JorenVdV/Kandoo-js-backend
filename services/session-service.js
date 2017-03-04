/**
 * Created by steve on 2/8/2017.
 */
const Session = require('../models/session');

const replaceUndefinedOrNullOrEmptyObject = require('../_helpers/replacers');

class SessionService {
    constructor() {
        this.sessionRepo = require('../repositories/session-repository');
        this.userService = require('../services/user-service');
        this.mailService = require('../services/mail-service');
    }

    async addSession(title, description, circleType, minCardsPerParticipant, maxCardsPerParticipant, cards, canReviewCards, canAddCards,
                     participants, themeId, creator, startDate, amountOfCircles, turnDuration) {
        if (circleType != 'opportunity' && circleType != 'threat')
            throw new Error('Invalid circle type. Circle type should be "opportunity" or "threat".');
        else {
            let session = new Session();
            session.title = title;
            session.description = description;
            session.circleType = circleType;
            session.turnDuration = turnDuration ? turnDuration : 60000;
            session.minCardsPerParticipant = minCardsPerParticipant;
            session.maxCardsPerParticipant = maxCardsPerParticipant;
            session.amountOfCircles = amountOfCircles ? amountOfCircles : 5;
            session.cards = cards;
            session.cardsCanBeReviewed = canReviewCards;
            session.cardsCanBeAdded = canAddCards;
            session.theme = themeId;
            session.creator = creator._id;
            session.participants = participants;
            session.rounds = [];
            session.startDate = startDate ? startDate : null;

            return await this.sessionRepo.createSession(session);
        }
    }

    async getSession(sessionId) {
        return await this.sessionRepo.readSessionById(sessionId);
    }

    async getSessionsByTheme(themeId) {
        return await this.sessionRepo.readSessionsByTheme(themeId);
    }

    async getSessionsByInvitee(inviteeId) {
        let email = this.userService.getUserById(inviteeId).emailAddress;
        return await this.sessionRepo.readSessionsByInvitee(email);
    }

    async getSessionsByParticipant(participantId) {
        return await this.sessionRepo.readSessionsByParticipant(participantId);
    }

    async changeSession(id, toUpdate) {
        toUpdate = await this.validateUpdate(id, toUpdate);
        return await this.sessionRepo.updateSession(id, toUpdate);
    }

    async validateUpdate(id, toUpdate) {
        let session = await this.getSession(id);
        toUpdate = JSON.parse(JSON.stringify(toUpdate, replaceUndefinedOrNullOrEmptyObject));
        if (toUpdate.startDate) {
            if (session.status)
                throw new Error('Cannot set a start date for started session.');
            if (session.startDate && new Date() >= session.startDate)
                throw new Error('Cannot set a start date for a started session.');
            // 10 seconds spare time for processing
            if (!toUpdate.startDate >= new Date(Date.now() - 10000))
                throw new Error('Cannot set a start date in the past');
        }
        return toUpdate;
    }

    async removeSession(sessionId) {
        let session = await this.getSession(sessionId);
        return await this.sessionRepo.deleteSession(session);
    }

    async updateInvitees(sessionId, invitees) {
        let session = await this.getSession(sessionId);

        let newInvitees = [];
        for (let i = 0; i <= invitees.length; i++) {
            let invitee = invitees[i];
            if (!session.invitees.includes(invitee))
                newInvitees.push(invitee + '');
        }

        if(newInvitees.length > 0){
            let sessionParticipantsEmailAddresses = session.participants.map(user => user.emailAddress);
            let errors = [];
            for (let i = 0; i <= newInvitees.length; i++) {
                let invitee = newInvitees[i];
                if (sessionParticipantsEmailAddresses.includes(invitee))
                    errors.push(invitee + ' is already a participant of this session');
            }
            if (errors.length > 0)
                throw new Error(errors.join('\n'));
        }

        let updatedSession = await this.changeSession(sessionId, {invitees: invitees});

        //send out emails
        if(newInvitees.length > 0){
            this.mailService.sendSessionInvite(newInvitees, session.title);
        }

        return updatedSession;
    }

    async acceptInviteToSession(sessionId, userId) {
        let session = await this.getSession(sessionId);
        let user = await this.userService.getUserById(userId);
        if (session.participants.includes(user._id))
            throw new Error(user.emailAddress + ' is already participating in the session.');
        if (!session.invitees.includes(user.emailAddress))
            throw new Error(user.emailAddress + ' has not been invited to the session.');
        session.participants.push(user);
        session.invitees.splice(session.invitees.indexOf(user.emailAddress), 1);
        return await this.changeSession(sessionId, {invitees: session.invitees, participants: session.participants})
    }

    // async startSession(sessionId, callback) {
    //     this.getSession(sessionId, function (session, err, sessionRepo) {
    //         if (err)
    //             callback(false, err);
    //         if (!session.startDate || session.startDate >= new Date()) {
    //             session.startDate = new Date();
    //             sessionRepo.updateSession(session,
    //                 (success, err) => {
    //                     if (err) {
    //                         callback(false, err);
    //                     } else {
    //                         callback(true, err);
    //                     }
    //                 });
    //         }
    //     });
    //
    //     this.sessionRepo.updateSession(sessionId)
    // }
    //
    // async stopSession(sessionId, callback) {
    //     let session = this.getSession(sessionId);
    //     if (session.startDate) {
    //         session.endDate = new Date();
    //         this.sessionRepo.updateSession();
    //     }
    //     return session.endDate;
    // }

    // async addTurn(sessionId, card, user, callback) {
    //
    //     let session = this.getSession(sessionId);
    //
    //     let turns = session.turns;
    //     let currentCardPriority = session.amountOfCircles - 1;
    //     let stopSearch = false;
    //
    //     turns.reverse().forEach(function (turn) {
    //         if (stopSearch)
    //             return;
    //
    //
    //         if (turn.card.card._id == card._id) {
    //             currentCardPriority = turn.priority;
    //             stopSearch = true;
    //         }
    //     });
    //
    //     session.turns.push({priority: currentCardPriority, card: card, user: user});
    //
    //     return true;
    // }

}

module.exports = new SessionService();