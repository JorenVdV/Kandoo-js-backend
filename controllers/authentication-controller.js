/**
 * Created by steve on 3/9/2017.
 */
const jwt = require('jsonwebtoken');
const config = require('../_config');

const userService = require('../services/user-service');
const themeService = require('../services/user-service');
const sessionService = require('../services/user-service');

exports.adminAccess = function (req, res, next) {

};

exports.organiserAccess = function (req, res, next) {

};

exports.participantAccess = function (req, res, next) {

};

exports.userAccess = function (req, res, next) {
    let token = req.body.token || req.headers['x-access-token'];
    try {
        let payload = jwt.verify(token, config.jwt.secret);
        userService.getUserById(payload.userId)
            .then((user) => next())
            .catch((err) => res.sendStatus(401))
    } catch (err) {
        res.sendStatus(401);
    }
};
