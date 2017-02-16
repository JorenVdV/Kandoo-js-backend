/**
 * Created by steve on 2/10/2017.
 */


class UserController {
    constructor() {
        this.userService = require('../services/user-service');
    }

    createUser(req, res) {
        let body = req.body;
        try {
            let user = this.userService.createUser(body.firstname, body.lastname, body.emailAddress, body.organisation ? body.organisation : null, body.password);
            res.sendStatus(201);
        } catch (e) {
            res.status(404).send({error: e.message});
        }
    }

    login(req, res) {
        let body = req.body;
        let user = this.userService.findUserByEmail(body.emailAddress);
        if (user.password === body.password)
            res.status(200).send({user: user});
        else
            res.sendStatus(401);
    }

    getUsers(req, res) {
        let users = this.userService.findUsers();
        if (users) res.send({users: users});
        else res.sendStatus(404);
    }

    deleteUser(req, res) {
        if (this.userService.removeUser(req.params.userId)) {
            res.sendStatus(204);
        }
        else {
            res.sendStatus(400);
        }

    }

}

module.exports = new UserController();