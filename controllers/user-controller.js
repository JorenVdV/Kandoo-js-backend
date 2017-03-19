/**
 * Created by steve on 2/10/2017.
 */
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = require('../_config');

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


    // login(req, res) {
    //     let body = req.body;
    //     this.userService.getUserByEmail(body.emailAddress.toLowerCase()).then(
    //         (user) => {
    //             if (bcrypt.compareSync(body.password, user.password)) {

    //
    // var sendNotification = function(data) {
    //     var headers = {
    //         "Content-Type": "application/json; charset=utf-8",
    //         "Authorization": "Basic MzkyMWQzNDItNjk4ZC00M2E5LWE2OGMtY2U0ZjY3NzhiNjA0"
    //     };
    //
    //     var options = {
    //         host: "onesignal.com",
    //         port: 443,
    //         path: "/api/v1/notifications",
    //         method: "POST",
    //         headers: headers
    //     };
    //
    //     var https = require('https');
    //     var req = https.request(options, function(res) {
    //         res.on('data', function(data) {
    //             console.log("Response:");
    //             console.log(JSON.parse(data));
    //         });
    //     });
    //
    //     req.on('error', function(e) {
    //         console.log("ERROR:");
    //         console.log(e);
    //     });
    //
    //     req.write(JSON.stringify(data));
    //     req.end();
    // };
    //
    // var message = {
    //     app_id: "1557f220-f307-429b-a8d3-7e2e4f133cb0",
    //     contents: {"en": "The following user logged in: " + user},
    //     included_segments: ["All"]
    // };
    //
    // sendNotification(message);

    // res.status(200).send({user: convertToUserDTO(user)});
    // } else {
    //     res.status(404).send({error: "Email address or password is incorrect"});
    // }
    // }
    // ).catch((err) => res.status(404).send({error: "Email address or password is incorrect"}));
    // }


    login(req, res) {
        let body = req.body;
        this.userService.getUserByEmail(body.emailAddress.toLowerCase()).then(
            (user) => {
                if (bcrypt.compareSync(body.password, user.password)) {
                    let token;
                    if (user.token) {
                        let decoded;
                        try{
                            decoded = jwt.verify(user.token, config.jwt.secret);
                        } catch(err){
                            // jwt expired
                        }
                        if (decoded && decoded.exp >= ((+(new Date()) / 1000 ) + 900))
                            token = user.token;
                    }
                    if (!token) {
                        let payload = {
                            userId: user._id
                        };
                        token = jwt.sign(payload, config.jwt.secret, config.jwt.options);
                        this.userService.changeUser(user._id, {token: token})
                            .then((success) => res.status(200).send({userId: user._id, token: token}))
                            .catch((err) => console.log(err));
                    } else
                        res.status(200).send({userId: user._id, token: token});
                }
                else
                    res.status(404).send({error: "Email address or password is incorrect"});
            }).catch((err) => res.status(404).send({error: "Email address or password is incorrect"}));
    }

    getUser(req, res) {
        this.userService.getUserById(req.params.userId)
            .then((user) => res.status(200).send({user: convertToUserDTO(user)}))
            .catch((err) => res.status(404).send({error: err.message}));
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
            password: body.password,
            originalPassword: body.originalPassword
        };
        this.userService.changeUser(req.params.userId, toUpdate)
            .then((user) => {
                res.status(200).send({user: convertToUserDTO(user)});
            })
            .catch((err) => {
                res.status(400).send({error: err.message})
            })
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