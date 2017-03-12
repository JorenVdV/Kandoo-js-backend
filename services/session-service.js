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
        this.cardService = require('../services/card-service');
        // this.themeService = require('../services/theme-service');
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
            session.sessionCards = cards;
            session.cardsCanBeReviewed = canReviewCards;
            session.cardsCanBeAdded = canAddCards;
            session.theme = themeId;
            session.creator = creator;
            session.participants = participants;
            session.rounds = [];
            session.startDate = startDate ? startDate : null;
            session.cards = [];
            session.pickedCards = [];

            // let event = {
            //     eventType: 'create',
            //     content: true,
            //     userId: creator,
            //     timestamp: Date.now()
            // };
            // session.events = [event];
            session.status = 'created';

            return await this.sessionRepo.createSession(session);
        }
    }

    async copySession(sessionId){
        let session = await this.getSession(sessionId);
        let newSession = new Session();
        newSession.title = session.title;
        newSession.description = session.description;
        newSession.circleType = session.circleType;
        newSession.turnDuration = session.turnDuration;
        newSession.minCardsPerParticipant = session.minCardsPerParticipant;
        newSession.maxCardsPerParticipant = session.maxCardsPerParticipant;
        newSession.amountOfCircles = session.amountOfCircles;
        newSession.sessionCards = session.sessionCards;
        newSession.cardsCanBeReviewed = session.canReviewCards;
        newSession.cardsCanBeAdded = session.canAddCards;
        newSession.theme = session.themeId;
        newSession.creator = session.creator;
        newSession.participants = [session.creator];
        newSession.rounds = [];
        newSession.cards = [];
        newSession.pickedCards = [];

        session.status = 'created';
        return await this.sessionRepo.createSession(session);
    }

    async getSession(sessionId) {
        return await this.sessionRepo.readSessionById(sessionId);
    }

    async getSessionsByTheme(themeId) {
        return await this.sessionRepo.readSessionsByTheme(themeId);
    }

    async getSessionsByInvitee(inviteeId) {
        let user = await this.userService.getUserById(inviteeId);
        return await this.sessionRepo.readSessionsByInvitee(user.emailAddress);
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
            if (session.status !== 'created')
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
        newInvitees = newInvitees.filter(currInvitee => currInvitee && currInvitee !== 'undefined');

        if (newInvitees.length > 0) {
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

        session = await this.changeSession(sessionId, {invitees: invitees});

        //send out emails
        if (newInvitees.length > 0) {
            this.mailService.sendSessionInvite(newInvitees, session.title);
        }

        return session;
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

    async getPickedCardsByUser(sessionId, userId) {
        return await this.sessionRepo.readPickedCardsByUser(sessionId, userId);
    }

    async pickCards(id, userId, cards) {
        // console.log('pickcards');
        let session = await this.getSession(id);

        if (!session.participants.map(user => user._id.toString()).includes(userId.toString()))
            throw new Error('User is not a participant of this session');

        let toUpdate = {};
        toUpdate.pickedCards = session.pickedCards;
        if (toUpdate.pickedCards.map(pc => pc.cards.userId).includes(userId)) {
            let index = toUpdate.pickedCards.findIndex(pc => pc.userId == userId);
            toUpdate.pickedCards[index].cards = cards;
        } else {
            toUpdate.pickedCards.push({
                userId: userId,
                cards: cards
            });
        }
        let updatedSession = await this.sessionRepo.updateSession(id, toUpdate);
        // console.log('service - pickedCards - updatedSession');
        // console.log(updatedSession.pickedCards);
        let cardsPickedByUser = updatedSession.pickedCards.find((obj => obj.userId.toString() === userId.toString()));
        // console.log('service - pickedCards - cardsPickedByUser');
        // console.log(cardsPickedByUser);
        // cardsPickedByUser = updatedSession.pickedCards[0];
        // console.log('service - pickedCards - cardsPickedByUser');
        // console.log(cardsPickedByUser);
        return cardsPickedByUser;
    }

    async addCard(id, description) {
        let session = await this.getSession(id);

        if (!session.cardsCanBeAdded)
            throw new Error('Session does not allow cards to be added');

        let card = await this.cardService.addCard(description, session.theme);
        session.sessionCards.push(card);
        return await this.sessionRepo.updateSession(id, {sessionCards: session.sessionCards})
    }

    async startSession(sessionId, userId) {
        let session = await this.sessionRepo.readSessionById(sessionId, true);
        let theme = session.theme;
        let organisers = theme.organisers;

        if (!organisers.map(user => user.toString()).includes(userId.toString()))
            throw new Error('User is not an organiser of this session');

        let toUpdate = {};

        // toUpdate.events = session.events;
        if (session.status !== 'created')
            throw new Error('Unable to start an already started/finished session');
        // toUpdate.events.push({
        //     eventType: 'start',
        //     userId: userId,
        //     content: true,
        //     timestamp: Date.now()
        // });
        toUpdate.status = 'started';
        toUpdate.startDate = new Date();
        toUpdate.currentUser = session.participants[0];
        toUpdate.cardPriorities = [];

        let sessionPickedCards = session.pickedCards;

        for (let i = 0; i < sessionPickedCards.length; i++) {
            let currUserCards = sessionPickedCards[i].cards;
            for (let y = 0; y < currUserCards.length; y++) {
                if (toUpdate.cardPriorities.findIndex(cardPriority => cardPriority.card.toString() === currUserCards[y].toString()) === -1){
                    toUpdate.cardPriorities.push({priority: 0, card: currUserCards[y]});
                    // console.log('toUpdate.cardPriorities did not yet contain card with id: ' + currUserCards[y].toString());
                }

            }

        }

        return await this.sessionRepo.updateSession(sessionId, toUpdate)
    }

    async pauseSession(sessionId, userId) {
        let session = await this.sessionRepo.readSessionById(sessionId, true);
        let theme = session.theme;
        let organisers = theme.organisers;

        if (!organisers.map(user => user.toString()).includes(userId.toString()))
            throw new Error('User is not an organiser of this session');


        let toUpdate = {};

        // toUpdate.events = session.events;
        if (session.status === 'created')
            throw new Error('Unable to pause a not yet started session');
        if (session.status === 'finished')
            throw new Error('Unable to pause an already finished session');
        toUpdate.status = session.status;
        // toUpdate.events.push({
        //     eventType: 'pause',
        //     userId: userId,
        //     content: true,
        //     timestamp: Date.now()
        // });
        if (toUpdate.status === 'started') {
            toUpdate.status = 'paused';
        } else {
            toUpdate.status = 'started';
        }
        return await this.sessionRepo.updateSession(sessionId, toUpdate)
    }

    async stopSession(sessionId, userId) {
        let session = await this.sessionRepo.readSessionById(sessionId, true);
        let theme = session.theme;
        let organisers = theme.organisers;

        if (!organisers.map(user => user.toString()).includes(userId.toString()))
            throw new Error('User is not an organiser of this session');

        let toUpdate = {};

        if (session.status === 'finished') {
            throw new Error('Unable to stop an already finished session');
        }
        if (session.status === 'created') {
            throw new Error("Unable to stop a session that hasn't started yet");
        }
        toUpdate.status = 'finished';

        // toUpdate.events = session.events;
        // toUpdate.events.push({
        //     eventType: 'stop',
        //     userId: userId,
        //     content: true,
        //     timestamp: Date.now()
        // });
        toUpdate.endDate = new Date();

        return await this.sessionRepo.updateSession(sessionId, toUpdate)
    }

    async playTurn(sessionId, userId, cardId) {
        let session = await this.getSession(sessionId);
        let toUpdate = {};

        if (session.status === 'paused' || session.status === 'stopped')
            throw new Error('Cannot perform a turn when the session is paused or stopped');

        if (session.currentUser._id.toString() !== userId.toString())
            throw new Error('Only the current user can complete his turn');

        // toUpdate.events = session.events;

        // toUpdate.events.push({
        //     eventType: 'priority',
        //     userId: userId,
        //     content: cardId,
        //     timestamp: Date.now()
        // });

        toUpdate.cardPriorities = session.cardPriorities;
        // console.log('cardPriorities');
        // console.log(toUpdate.cardPriorities);
        toUpdate.cardPriorities.find(cardPriorities => cardPriorities.card.toString() == cardId.toString()).priority++;

        let participants = session.participants;
        let indexOfCurrUser = participants.findIndex((participant) => participant._id.toString() === userId.toString());
        // console.log('indexOfCurrUser: ' + indexOfCurrUser);

        let indexOfNextUser = indexOfCurrUser + 1;
        if (indexOfNextUser === participants.length)
            indexOfNextUser = 0;

        // console.log('indexOfCurrUser: ' + indexOfNextUser);
        toUpdate.currentUser = participants[indexOfNextUser];
        // console.log(userId);
        // console.log(toUpdate.currentUser._id);

        return await this.sessionRepo.updateSession(sessionId, toUpdate);
    }

}

module.exports = new SessionService();