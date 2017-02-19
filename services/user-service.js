const User = require('../models/user');

class UserService {

    constructor() {
        this.userRepo = require('../repositories/user-repository');
    }

    createUser(firstname, lastname, emailAddress, organisation, password) {
        if (this.userRepo.getUserByEmail(emailAddress))
            throw new Error('Email address is already in use.');

        let user = new User();
        user.firstname = firstname;
        user.lastname = lastname;
        user.emailAddress = emailAddress;
        user.organisation = organisation ? organisation : "";
        user.password = password;

        return this.userRepo.createUser(user);

    }

    removeUser(id) {
        // let user = this.userRepo.getUserById(id);
        // this.userRepo.deleteUser(user);
        this.userRepo.deleteUser(id);
    }

    findUserById(id) {
        return this.userRepo.getUserById(id);
    }

    findUserByEmail(email) {
        return this.userRepo.getUserByEmail(email);
    }

    findUsers() {
        return this.userRepo.getUsers();
    }
}

module.exports = new UserService();