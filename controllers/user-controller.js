/**
 * Created by steve on 2/10/2017.
 */


class UserController{
    constructor(){
        this.service = require('../services/user-service');
    }

    createUser(req,res){
        let body = req.body;
        let user = this.service.createUser(body.firstname, body.lastname, body.emailAddress, body.organisation ? body.organisation : null, body.password);
        if(user){
            res.sendStatus(201);
        }else{
            res.sendStatus(404);
        }
    }

    login(req,res){
        let body = req.body;
        let user = this.service.findUserByEmail(body.emailAddress);
        if(user.password === body.password)
            res.status(200).send({user:user});
        else
            res.sendStatus(401);
    }

    getUser(req,res){

    }

    getUsers(req,res){
        let users = this.service.findUsers();
        if(users) res.send({users: users});
        else res.sendStatus(404);
    }

    deleteUser(req,res){

    }
}

module.exports = new UserController();