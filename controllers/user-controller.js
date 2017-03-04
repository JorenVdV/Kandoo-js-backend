/**
 * Created by steve on 2/10/2017.
 */
const bcrypt = require('bcrypt');

function convertToUserDTO(user) {
    let userDTO = {
        _id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        emailAddress: user.emailAddress,
        organisation: user.organisation,
        avatar: user.avatar,
        settings: user.settings
    };
    return userDTO;
}

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
                if (bcrypt.compareSync(body.password, user.password))
                    res.status(200).send({user: convertToUserDTO(user)});
                else
                    res.status(404).send({error: "Email address or password is incorrect"});
            }
        ).catch((err) => res.status(404).send({error: "Email address or password is incorrect"}));
    }

    updateUser(req, res) {
        let body = req.body;
        let toUpdate = {
            firstname: body.firstname,
            lastname: body.lastname,
            emailAddress: body.emailAddress,
            organisation: body.organisation,
            settings: body.settings,
            avatar: body.avatar,
            password: body.password
        };
        this.userService.changeUser(req.params.userId, toUpdate)
            .then((user) => res.status(200).send({user: convertToUserDTO(user)}))
            .catch((err) => res.status(400).send({error: err.message}))
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