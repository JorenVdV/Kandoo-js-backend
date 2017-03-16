/**
 * Created by steve on 3/9/2017.
 */
const jwt = require('jsonwebtoken');
const config = require('../_config');

const userService = require('../services/user-service');
const themeService = require('../services/theme-service');
const sessionService = require('../services/session-service');

exports.adminAccess = function (req, res, next) {

};

exports.organiserAccess = function (req, res, next) {
    let token = req.body.token || req.headers['x-access-token'];

    let payload;
    try {
        payload = jwt.verify(token, config.jwt.secret);
    } catch (err) {
        res.status(401).send({error: err.message});
    }
    if (payload) {
        let themeId = req.params.themeId || req.body.themeId;
        let sessionId = req.params.sessionId || req.body.sessionId;

        if (themeId) {
            themeService.getTheme(themeId)
                .then((theme) => {
                    let themeOrganisersAsStrings = theme.organisers.map(org => org._id.toString());
                    if (themeOrganisersAsStrings.findIndex(userId => userId === payload.userId.toString()) !== -1) {
                        next()
                    }
                }).catch((err) => res.status(404).send({error: err.message}));
        } else if (sessionId) {
            sessionService.getSession(sessionId)
                .then((session) => {
                    let sessionOrganisersAsStrings = session.theme.organisers.map(org => org.toString());
                    if (sessionOrganisersAsStrings.findIndex(userId => userId === payload.userId.toString()) !== -1) {
                        next()
                    }
                }).catch((err) => res.status(404).send({error: err.message}));
        }
        else
            res.status(401).send({error: "User needs to be an organiser to perform this action"});
    }else{
        res.sendStatus(404);
    }
};

exports.participantAccess = function (req, res, next) {
    let token = req.body.token || req.headers['x-access-token'];
    let payload = jwt.verify(token, config.jwt.secret);

    let sessionId = req.params.sessionId || req.body.sessionId;
    if(sessionId){
        sessionService.getSession(sessionId)
            .then((session) => {
                let found = false;
                let sessionParticipantsAsStrings = session.participants.map(part => part._id.toString());
                if (sessionParticipantsAsStrings.findIndex(userId => userId === payload.userId.toString()) !== -1) {
                    found = true;
                    next();
                }
                let sessionOrganisersAsStrings = session.theme.organisers.map(org => org.toString());
                if (!found && sessionOrganisersAsStrings.findIndex(userId => userId === payload.userId.toString()) !== -1) {
                    found = true;
                    next();
                }
                if(!found){
                    res.status(401).send({error: "User needs to be a participant or organiser to perform this action."});
                }
            }).catch((err) => res.status(404).send({error: err.message}));
    } else {
        res.sendStatus(404);
    }
};

exports.userAccess = function (req, res, next) {
    let token = req.body.token || req.headers['x-access-token'];
    try {
        let payload = jwt.verify(token, config.jwt.secret);
        userService.getUserById(payload.userId)
            .then((user) => next())
            .catch((err) => res.sendStatus(404))
    } catch (err) {
        res.sendStatus(401)
    }
};
