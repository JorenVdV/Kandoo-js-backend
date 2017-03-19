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
    // console.log(req.originalUrl);
    // console.log(req.headers);

    let token = req.body.token || req.headers['x-access-token'];

    // console.log('token');
    // console.log(token);

    let payload;
    try {
        payload = jwt.verify(token, config.jwt.secret);
    } catch (err) {
        handleTokenError(err, res);
    }

    // console.log('payload');
    // console.log(payload);


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
    } else {
        res.sendStatus(404);
    }
};

exports.participantAccess = function (req, res, next) {

    // console.log(req.originalUrl);
    // console.log(req.headers);

    let token = req.body.token || req.headers['x-access-token'];

    // console.log('token');
    // console.log(token);

    let payload;
    try {
        payload = jwt.verify(token, config.jwt.secret);
    } catch (err) {
        handleTokenError(err, res);
    }

    // console.log('payload');
    // console.log(payload);

    if (payload) {
        let sessionId = req.params.sessionId || req.body.sessionId;
        if (sessionId) {
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
                    if (!found) {
                        res.status(401).send({error: "User needs to be a participant or organiser to perform this action."});
                    }
                }).catch((err) => res.status(404).send({error: err.message}));
        } else {
            res.sendStatus(404);
        }
    }

};

exports.userAccess = function (req, res, next) {

    // console.log(req.originalUrl);
    // console.log(req.headers);

    let token = req.body.token || req.headers['x-access-token'];
    let userId = req.body.userId || req.params.userId;

    // console.log('token');
    // console.log(token);

    let payload;
    try {
        payload = jwt.verify(token, config.jwt.secret);
    } catch (err) {
        handleTokenError(err, res);
    }

    // console.log('payload');
    // console.log(payload);

    if (payload) {
        userService.getUserById(payload.userId)
            .then((user) => {
                if (user._id.toString() === userId.toString()) {
                    next();
                }
                else {
                    res.sendStatus(401);
                }
            })
            .catch((err) => res.sendStatus(404))
    }
};

function handleTokenError(err, res) {
    if (err.name === 'TokenExpiredError') {
        res.status(401).send({error: err.message + ' at ' + err.expiredAt});
    } else if (err.name === 'JsonWebTokenError') {
        res.sendStatus(401);
    }
}