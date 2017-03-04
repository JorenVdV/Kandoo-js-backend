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
            [], req.params.themeId, body.creator, body.startDate, body.amountOfCircles, body.turnDuration)
            .then((session) => res.status(201).send({session: session}))
            .catch((err) => res.status(404).send({error: err.message}));
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
            .then((session) => res.status(200).send({session: session}))
            .catch((err) => res.status(400).send({error: err.message}));
    }

    playTurn(req, res) {
        this.userService.findUserById(req.params.userId, function (user, err) {
            let cardService = require('../services/card-service');
            let sessionService = require('../services/session-service');

            let card = cardService.find(req.params.cardId);

            if (sessionService.addTurn(req.params.sessionId, card, user))
                res.sendStatus(201);
            else
                res.sendStatus(400);
        });
    }

    // startSession(req, res) {
    //     let sessionId = req.params.sessionId;
    //     if (this.sessionService.startSession(sessionId))
    //         res.sendStatus(202);
    //     else
    //         res.sendStatus(400);
    // }
    //
    // stopSession(req, res) {
    //     let sessionId = req.params.sessionId;
    //     if (this.sessionService.stopSession(sessionId))
    //         res.sendStatus(202);
    //     else
    //         res.sendStatus(400);
    // }

    updateSession(req, res) {
        let body = req.body;
        let toUpdate = bodyToUpdateDTO(body);
        this.sessionService.changeSession(req.params.sessionId, toUpdate)
            .then((session) => res.status(200).send({session: session}))
            .catch((err) => res.status(400).send({error: err.message}))
    }
}

module.exports = new SessionController();