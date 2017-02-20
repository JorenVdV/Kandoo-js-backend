/**
 * Created by steve on 2/10/2017.
 */


class UserController {
    constructor() {
        this.userService = require('../services/user-service');
    }

    createUser(req, res) {
        let body = req.body;
        this.userService.createUser(body.firstname, body.lastname, body.emailAddress, body.organisation ? body.organisation : null, body.password, function (user, err) {
            if (err)
                res.status(404).send({error: err.message});
            else
                res.sendStatus(201);
        });
    }

    login(req, res) {
        let body = req.body;
        this.userService.findUserByEmail(body.emailAddress, function (user, err) {
            if (err) {
                res.status(404).send({error: err.message});
            }
            else if (user.password === body.password)
                res.status(200).send({user: user});
            else
                res.status(401).send({error: "Password is incorrect"});
        });

    }

    getUsers(req, res) {
        this.userService.findUsers(function (users, err) {
            if (err) res.status(404).send({error: err});
            else res.status(200).send({users: users});
        });

    }

    deleteUser(req, res) {
        this.userService.removeUser(req.params.userId, function (success, err) {
            if (!success && err) {
                res.status(404).send({error: err.message});
            } else if (err) {
                res.sendStatus(400);
            } else {
                res.sendStatus(204);
            }
        });
    }

}

module.exports = new UserController();