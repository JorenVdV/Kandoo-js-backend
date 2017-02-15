/**
 * Created by steve on 2/10/2017.
 */
class SessionController {
    constructor() {
        this.sessionService = require('../services/session-service');
        this.themeService = require('../services/theme-service');
        this.userService = require('../services/user-service');
        this.cardServce = require('../services/card-service');
    }

    createSession(req, res) {
        let body = req.body;
        let session = this.sessionService.createSession(body.title, body.description,
            body.circleType, body.turnDuration,
            body.cardsPerParticipant, body.cards,
            body.cardsCanBeReviewed, body.cardsCanBeAdded,
            [], req.params.themeId, body.creator, body.startDate ? body.startDate : null);
        if (session)
            res.status(201).send({session: session});
        else
            res.sendStatus(400);
    }

    getSession(req, res) {
        let session = this.sessionService.getSession(req.params.sessionId);
        if (session)
            res.status(200).send({session: session});
        else
            res.sendStatus(400);
    }

    getSessions(req, res) {
        let sessions = this.sessionService.getSessions(req.params.themeId);
        if (sessions)
            res.status(200).send({sessions: sessions});
        else
            res.sendStatus(400);
    }

    deleteSession(req, res) {
        if (this.sessionService.deleteSession(req.params.sessionId))
            res.sendStatus(204);
        else
            res.sendStatus(400);
    }

    playTurn(req, res) {
        let user = this.userService.findUserById(req.params.userId);
        let session = this.sessionService.getSession(req.params.sessionId);
        let card = this.cardServce.find(req.params.cardId);


        if (this.sessionService.addTurn(session, card, user))
            res.sendStatus(201);
        else
            res.sendStatus(400);


    }
}

module.exports = new SessionController();