/**
 * Created by steve on 2/10/2017.
 */
class SessionController{
    constructor(){
        this.sessionService = require('../services/session-service');
        this.themeService = require('../services/theme-service');
    }

    createSession(req,res){
        let body = req.body;
        let session = this.sessionService.createSession(body.title, body.description,
            body.circleType, body.turnDuration,
            body.cardsPerParticipant, body.cards,
            body.cardsCanBeReviewed, body.cardsCanBeAdded,
            [], req.params.themeId, body.creator, body.startDate ? body.startDate : null);
        if(session)
            res.status(201).send({session:session});
        else
            res.sendStatus(400);
    }

    getSession(req,res){
        let session = this.sessionService.getSession(req.params.sessionId);
        if(session)
            res.status(200).send({session:session});
        else
            res.sendStatus(400);
    }
}

module.exports = new SessionController();