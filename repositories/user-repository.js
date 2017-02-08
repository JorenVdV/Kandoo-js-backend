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

    getUserByName(firstname, lastname) {
        return this.userDao.find(user => user.firstname === firstname && user.lastname === lastname);
    }

    createUser(firstname, lastname, dateOfBirth, emailAddress, profilePicture = null) {
        let user = new User();
        user.firstname = firstname;
        user.lastname = lastname;
        user.dateOfBirth = dateOfBirth;
        user.emailAddress = emailAddress;
        if (profilePicture)
            user.profilePicture = profilePicture;

        this.userDao.push(user);
        return user;
    }

    updateUser() {

    }

    deleteUser(id) {
        this.userDao.splice(this.userDao.findIndex(user => user._id === id));
    }

}