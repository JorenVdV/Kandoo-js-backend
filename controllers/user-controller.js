/**
 * Created by steve on 2/10/2017.
 */


class UserController {
    constructor() {
        this.userService = require('../services/user-service');
    }

    createUser(req, res) {
        let resolve = async(req, res) => {
            let body = req.body;
            try {
                let user = await this.userService.createUser(body.firstname, body.lastname, body.emailAddress, body.organisation ? body.organisation : null, body.password);
                res.sendStatus(201);
            } catch (err) {
                res.status(404).send({error: err.message});
            }
        };
        resolve(req, res);
    }

    login(req, res) {
        let resolve = async(req, res) => {
            let body = req.body;
            try {
                let user = await this.userService.getUserByEmail(body.emailAddress);
                if (user.password === body.password)
                    res.status(200).send({user: user});
                else
                    res.status(401).send({error: "Password is incorrect"});
            } catch (err) {
                res.status(404).send({error: err.message});
            }
        };
        resolve(req, res);
    }

    getUsers(req, res) {
        let resolve = async(req, res) => {
            try {
                let users = await this.userService.getUsers();
                res.status(200).send({users: users})
            } catch (err) {
                res.status(404).send({error: err.message});
            }
        };
        resolve(req, res);
    }

    deleteUser(req, res) {
        let resolve = async(req, res) => {
            let body = req.body;
            try {
                let successful = await this.userService.removeUser(req.params.userId);
                if(successful)
                    res.sendStatus(204);
            } catch (err) {
                res.status(404).send({error: err.message});
            }
        };
        resolve(req, res);
    }

}

module.exports = new UserController();