/**
 * Created by steve on 2/8/2017.
 */
const User = require('../models/user');

class UserRepository {
    constructor() {
        this.userDao = [];
    }

    getUserById(id) {
        return this.userDao.find(user => user._id === id);
    }

    getUserByEmail(email) {
        return this.userDao.find(user => user.emailAddress === email);
    }

    createUser(user) {
        this.userDao.push(user);
        return user;
    }

    updateUser() {

    }

    deleteUser(id) {
        this.userDao.splice(this.userDao.findIndex(user => user._id === id));
    }
}

module.exports = new UserRepository();