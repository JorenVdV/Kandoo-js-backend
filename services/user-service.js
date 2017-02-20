const User = require('../models/user');

class UserService {

    constructor() {
        this.userRepo = require('../repositories/user-repository');
    }

    createUser(firstname, lastname, emailAddress, organisation, password, callback) {
        let newUser = new User();
        newUser.firstname = firstname;
        newUser.lastname = lastname;
        newUser.emailAddress = emailAddress;
        newUser.organisation = organisation ? organisation : "";
        newUser.password = password;

        this.userRepo.createUser(newUser, function (user, err) {
            if (err) {
                callback(null, err);
            } else {
                callback(user);
            }
        });
    }

    removeUser(id, callback1) {
        this.userRepo.deleteUser(id, function (succes, err) {
            if (!succes && err)
                callback1(succes, err);
            else if (err) {
                callback1(err);
            } else
                callback1(succes);
        });
    }

    findUserById(id, callback) {
        this.userRepo.getUserById(id, function (user, err) {
            if (err)
                callback(null, err);
            else
                callback(user);
        });
    }

    findUserByEmail(email, callback) {
        this.userRepo.getUserByEmail(email, function (user, err) {
            if (err)
                callback(null, err);
            else
                callback(user);
        });
    }

    // promise_findUserById(id) {
    //     return new Promise(function (resolve, reject) {
    //         this.userRepo.promise_getUserById(id)
    //             .then((user) => {
    //                 resolve(user);
    //             })
    //             .catch((err) => {
    //                 reject(err);
    //             })
    //     });
    // }
    //
    // promise_findUserByEmail(email) {
    //     return new Promise(function (resolve, reject) {
    //         this.userRepo.promise_getUserByEmail(email)
    //             .then((user) => {
    //                 resolve(user);
    //             })
    //             .catch((err) => {
    //                 reject(err);
    //             })
    //     });
    // }
    //
    // promise_findUserByEmailAndDelete(email) {
    //     return Promise(function (resolve, reject) {
    //         this.userRepo.promise_getUserByEmail(email)
    //             .then((user) => {
    //                 if (user) {
    //                     resolve(this.userRepo.promise_deleteUser(user));
    //                 } else {
    //                     reject(new Error('Id does not exist'));
    //                 }
    //             })
    //             .catch((err) => {
    //                 reject(err);
    //             })
    //     });
    // }

    findUsers(callback) {
        this.userRepo.getUsers(function (users, err) {
            if (err)
                callback(null, err);
            else
                callback(users);
        });
    }
}

module.exports = new UserService();