/**
 * Created by steve on 2/10/2017.
 */


class UserController {
    constructor() {
        this.userService = require('../services/user-service');
    }

    createUser(req, res) {
        let body = req.body;
        this.userService.addUser(body.firstname, body.lastname, body.emailAddress, body.organisation ? body.organisation : null, body.password)
            .then((user) => res.sendStatus(201))
            .catch((err) => res.status(404).send({error: err.message}));
    }

    login(req, res) {
        let body = req.body;
        this.userService.getUserByEmail(body.emailAddress).then(
            (user) => {
                if (user.password === body.password)
                    res.status(200).send({user: user});
                else
                    res.status(401).send({error: "Password is incorrect"});
            }
        ).catch((err) => res.status(404).send({error: err.message}));
    }

    getUsers(req, res) {
        this.userService.getUsers()
            .then((users) => res.status(200).send({users: users}))
            .catch((err) => res.status(404).send({error: err.message}));
    }

    deleteUser(req, res) {
        this.userService.removeUser(req.params.userId)
            .then((successful) => res.sendStatus(204))
            .catch((err) => res.status(404).send({error: err.message}));
    }

}

module.exports = new UserController();