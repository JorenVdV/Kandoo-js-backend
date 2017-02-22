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
        this.sessionService.createSession(body.title, body.description,
            body.circleType,
            body.minCardsPerParticipant, body.maxCardsPerParticipant, body.cards,
            body.cardsCanBeReviewed, body.cardsCanBeAdded,
            [], req.params.themeId, body.creator, body.startDate, body.amountOfCircles, body.turnDuration,
            function (session, err) {
                if (err) {
                    res.status(400).send({error: err.message});
                } else {
                    res.status(201).send({session: session});
                }
            });
    }

    getSession(req, res) {
        this.sessionService.getSession(req.params.sessionId, function (session, err) {
            if (err) {
                res.status(404).send({error: err.message});
            } else {
                res.status(200).send({session: session});
            }
        });
    }

    getSessions(req, res) {
        this.sessionService.getSessions(req.params.themeId, function (sessions, err) {
            if (err) {
                res.status(404).send({error: err.message});
            } else {
                res.status(200).send({sessions: sessions});
            }
        });
    }

    deleteSession(req, res) {
        this.sessionService.deleteSession(req.params.sessionId, function (success, err) {
            if (err) {
                res.status(404).send({error: err.message});
            } else {
                res.sendStatus(204);
            }
        });
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