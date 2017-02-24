const User = require('../models/user');

class UserRepository {
    constructor() {
        this.userDao = User;
    }

    async readUserById(id) {
        let user = await this.userDao.findOne({_id: id});
        if (user)
            return user;
        else
            throw new Error('Unable to find user with id: ' + id);
    }

    async readUserByEmail(email) {
        let user = await this.userDao.findOne({emailAddress: email});
        if (user)
            return user;
        else
            throw new Error('Unable to find user with email: ' + email);
    }

    async createUser(newUser) {
        await newUser.save();
        return newUser;
    }

    async readUsers() {
        let users = await this.userDao.find({});
        let userArray = [];
        users.forEach((user) => {
            userArray.push(user);
        });
        return userArray;
    }

    async updateUser() {

    }

    async deleteUser(user) {
        await user.remove();
        return true;

    }

}

module.exports = new UserRepository();