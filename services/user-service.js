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
            newUser.plainTextPassword = password;
            let salt = bcrypt.genSaltSync(saltRounds);
            newUser.password = bcrypt.hashSync(password, salt);

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
        let user = await this.getUserById(id);
        toUpdate = await this.validateUpdate(user, toUpdate);
        return await this.userRepo.updateUser(id, toUpdate);
    }

    async validateUpdate(user, toUpdate) {
        if (toUpdate.password) {
            if (!bcrypt.compareSync(toUpdate.originalPassword, user.password))
                throw new Error('Original password does not match');
            let salt = bcrypt.genSaltSync(saltRounds);
            toUpdate.plainTextPassword = toUpdate.password + '';
            toUpdate.password = bcrypt.hashSync(toUpdate.password, salt);
            toUpdate.originalPassword = null;
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

    sendSocketMessage(user, name, data) {
        var socket = socketService.getSocketofUser(user._id);
        socketService.sendNotification(socket, name, data)
    }

}

module.exports = new UserService();