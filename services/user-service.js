const User = require('../models/user');
const bcrypt = require('bcrypt');
const saltRounds = 10; // 15 = 1.8 - 2+ seconds

const replaceUndefinedOrNullOrEmptyObject = require('../_helpers/replacers');

class UserService {

    constructor() {
        this.userRepo = require('../repositories/user-repository');
    }

    // hashed using https://www.npmjs.com/package/bcrypt
    async addUser(firstname, lastname, emailAddress, organisation, password) {
        let user;
        try {
            user = await this.getUserByEmail(emailAddress);
        } catch (err) {
            let newUser = new User();
            newUser.firstname = firstname;
            newUser.lastname = lastname;
            newUser.emailAddress = emailAddress;
            newUser.organisation = organisation ? organisation : "";
            newUser.password = password;
            let salt = bcrypt.genSaltSync(saltRounds);
            newUser.securePassword = bcrypt.hashSync(password, salt);

            return await this.userRepo.createUser(newUser);
        }
        if (user)
            throw new Error('Email address is already in use');

    }

    async removeUser(id) {
        let user = await this.getUserById(id);
        return await this.userRepo.deleteUser(user);
    }

    async changeUser(id, toUpdate) {
        toUpdate = await this.validateUpdate(toUpdate);
        return await this.userRepo.updateUser(id, toUpdate);
    }

    async validateUpdate(toUpdate) {
        if(toUpdate.password){
            let salt = bcrypt.genSaltSync(saltRounds);
            toUpdate.securePassword = bcrypt.hashSync(toUpdate.password, salt);
        }
        return JSON.parse(JSON.stringify(toUpdate, replaceUndefinedOrNullOrEmptyObject));
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