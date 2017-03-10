/**
 * Created by steve on 3/9/2017.
 */
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = require('../_config');

const userService = require('../services/user-service');

function adminAcces(req, res, next) {

}

function organiserAcces(req, res, next) {

}

function participantAcces(req, res, next) {

}

exports.userAcces = function (req, res, next) {
    let token = req.body.token || req.headers['x-access-token'];
    try {
        let payload = jwt.verify(token, config.jwt.secret);
        userService.getUserById(payload.userId)
            .then((user) => next())
            .catch((err) => res.sendStatus(401))
    } catch (err) {
        res.sendStatus(401);
    }
}
