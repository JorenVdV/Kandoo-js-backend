/**
 * Created by steve on 2/10/2017.
 */
class SessionController {
    constructor() {
        this.sessionService = require('../services/session-service');
        this.themeService = require('../services/theme-service');
        this.userService = require('../services/user-service');
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
            res.sendStatus(404);
    }

    getSessions(req, res) {
        let sessions = this.sessionService.getSessions(req.params.themeId);
        if (sessions)
            res.status(200).send({sessions: sessions});
        else
            res.sendStatus(404);
    }

    deleteSession(req, res) {
        if (this.sessionService.deleteSession(req.params.sessionId))
            res.sendStatus(204);
        else
            res.sendStatus(404);
    }

    playTurn(req, res) {
        this.userService.findUserById(req.params.userId, function(user, err){
            let cardService = require('../services/card-service');
            let sessionService = require('../services/session-service');

            let card = cardService.find(req.params.cardId);

            if (sessionService.addTurn(req.params.sessionId, card, user))
                res.sendStatus(201);
            else
                res.sendStatus(400);
        });
    }

    inviteUser(req, res) {
        if (this.sessionService.invite(req.params.sessionId, req.body.userId)) {
            res.sendStatus(201);
        } else {
            res.sendStatus(404);
        }
    }

    startSession(req, res) {
        let sessionId = req.params.sessionId;
        if (this.sessionService.startSession(sessionId))
            res.sendStatus(202);
        else
            res.sendStatus(400);
    }

    stopSession(req, res) {
        let sessionId = req.params.sessionId;
        if (this.sessionService.stopSession(sessionId))
            res.sendStatus(202);
        else
            res.sendStatus(400);
    }
}

module.exports = new SessionController();