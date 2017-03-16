/**
 * Created by steve on 2/10/2017.
 */

function bodyToUpdateDTO(body) {
    return {
        title: body.title,
        description: body.description,
        circleType: body.circleType,
        minCardsPerParticipant: body.minCardsPerParticipant,
        maxCardsPerParticipant: body.maxCardsPerParticipant,
        amountOfCircles: body.amountOfCircles,
        sessionCards: body.sessionCards,
        cardsCanBeReviewed: body.cardsCanBeReviewed,
        cardsCanBeAdded: body.cardsCanBeAdded,
        turnDuration: body.turnDuration,
        startDate: body.startDate
    };
}

class SessionController {
    constructor() {
        this.sessionService = require('../services/session-service');
        this.themeService = require('../services/theme-service');
        this.userService = require('../services/user-service');
    }

    createSession(req, res) {
        let body = req.body;
        this.sessionService.addSession(body.title, body.description,
            body.circleType,
            body.minCardsPerParticipant, body.maxCardsPerParticipant, body.cards,
            body.cardsCanBeReviewed, body.cardsCanBeAdded,
            [body.creator], req.params.themeId, body.creator, body.startDate, body.amountOfCircles, body.turnDuration)
            .then((session) => res.status(201).send({session: session}))
            .catch((err) => res.status(404).send({error: err.message}));
    }

    copySession(req, res) {
        this.sessionService.copySession(req.params.sessionId, req.body.userId)
            .then((session) => res.status(201).send({session: session}))
            .catch((err) => res.status(400).send({error: err.message}));
    }

    getSession(req, res) {
        this.sessionService.getSession(req.params.sessionId)
            .then((session) => res.status(200).send({session: session}))
            .catch((err) => res.status(404).send({error: err.message}));
    }

    getSessionsByTheme(req, res) {
        this.sessionService.getSessionsByTheme(req.params.themeId)
            .then((sessions) => res.status(200).send({sessions: sessions}))
            .catch((err) => res.status(404).send({error: err.message}));
    }

    getSessionsByParticipant(req, res) {
        this.sessionService.getSessionsByParticipant(req.params.participantId)
            .then((sessions) => res.status(200).send({sessions: sessions}))
            .catch((err) => res.status(404).send({error: err.message}));
    }

    getSessionsByInvitee(req, res) {
        this.sessionService.getSessionsByInvitee(req.params.inviteeId)
            .then((sessions) => res.status(200).send({sessions: sessions}))
            .catch((err) => res.status(404).send({error: err.message}));
    }

    deleteSession(req, res) {
        this.sessionService.removeSession(req.params.sessionId)
            .then((success) => res.sendStatus(204))
            .catch((err) => res.status(404).send({error: err.message}));
    }

    updateSessionInvitees(req, res) {
        let body = req.body;
        this.sessionService.updateInvitees(req.params.sessionId, body.invitees)
            .then((session) => res.status(200).send({invitees: session.invitees}))
            .catch((err) => res.status(400).send({error: err.message}));
    }

    acceptInviteToSession(req, res) {
        let body = req.body;
        this.sessionService.acceptInviteToSession(req.params.sessionId, body.userId)
            .then((session) => res.sendStatus(204))
            .catch((err) => res.status(400).send({error: err.message}));
    }

    playTurn(req, res) {
        let body = req.body;
        console.log(req.body);
        this.sessionService.playTurn(req.params.sessionId, body.userId, body.cardId, body.circlePosition)
            .then((session) => {
                res.status(200).send({currentUser: session.currentUser, cardPriorities: session.cardPriorities})
            })
            .catch((err) => res.status(400).send({error: err.message}));
    }

    startSession(req, res) {
        let body = req.body;
        this.sessionService.startSession(req.params.sessionId, body.userId)
            .then((session) => res.sendStatus(204))
            .catch((err) => res.status(400).send({error: err.message}));
    }

    pauseSession(req, res) {
        let body = req.body;
        this.sessionService.pauseSession(req.params.sessionId, body.userId)
            .then((session) => res.sendStatus(204))
            .catch((err) => res.status(400).send({error: err.message}));
    }

    stopSession(req, res) {
        let body = req.body;
        this.sessionService.stopSession(req.params.sessionId, body.userId)
            .then((session) => res.sendStatus(204))
            .catch((err) => res.status(400).send({error: err.message}));
    }

    updateSession(req, res) {
        let body = req.body;
        let toUpdate = bodyToUpdateDTO(body);
        this.sessionService.changeSession(req.params.sessionId, toUpdate)
            .then((session) => res.status(200).send({session: session}))
            .catch((err) => res.status(400).send({error: err.message}))
    }

    pickCardsByUserId(req, res) {
        let body = req.body;
        this.sessionService.pickCards(req.params.sessionId, body.userId, body.cards)
            .then((userCards) => res.sendStatus(204))
            .catch((err) => res.sendStatus(400).send({error: err.message}));
    }

    getEvents(req, res) {
        this.sessionService.getEvents(req.params.sessionId)
            .then((events) => res.status(200).send({events: events}))
            .catch((err) => res.sendStatus(400).send({error: err.message}));
    }
}

module.exports = new SessionController();