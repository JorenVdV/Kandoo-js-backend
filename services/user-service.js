const User = require('../models/user');

class UserService {

    constructor() {
        this.userRepo = require('../repositories/user-repository');
    }

    async addUser(firstname, lastname, emailAddress, organisation, password) {
        let user;
        try{
            user = await this.getUserByEmail(emailAddress);
        } catch(err){
            let newUser = new User();
            newUser.firstname = firstname;
            newUser.lastname = lastname;
            newUser.emailAddress = emailAddress;
            newUser.organisation = organisation ? organisation : "";
            newUser.password = password;

            return await this.userRepo.createUser(newUser);
        }
        if(user)
            throw new Error('Email address is already in use');

    }

    async removeUser(id) {
        let user = await this.getUserById(id);
        return await this.userRepo.deleteUser(user);
    }

    async getUserById(id) {
        return await this.userRepo.readUserById(id);
    }

    async getUserByEmail(email) {
        return await this.userRepo.readUserByEmail(email);
    }

    async getUsers() {
        return await this.userRepo.readUsers();
    }

}

module.exports = new UserService();