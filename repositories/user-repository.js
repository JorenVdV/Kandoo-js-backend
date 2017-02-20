const User = require('../models/user');

class UserRepository {
    constructor() {
        this.userDao = User;
    }

    getUserById(id, callback) {
        this.userDao.findOne({'_id': id}, function (err, user) {
            if (err) {
                callback(null, new Error('Error trying to find user with id: ' + id + ' ' + err));
            } else {
                if (user)
                    callback(user);
                else
                    callback(null, new Error('Unable to find user with id: ' + id));
            }
        });
    }

    getUserByEmail(email, callback) {
        this.userDao.findOne({emailAddress: email}, function (err, user) {
            if (err) {
                callback(null, new Error('Error trying to find user with email: ' + email + ' ' + err));
            } else {
                if (user)
                    callback(user);
                else
                    callback(null, new Error('Unable to find user with email: ' + email));
            }
        });
    }

    createUser(newUser, callback) {
        this.userDao.findOne({emailAddress: newUser.emailAddress}, function (err, user) {
            if (err) {
                callback(null, err);
            } else if (user) {
                callback(null, new Error("Error: Email address is already in use"));
            } else {
                newUser.save(function (err) {
                    if (err) {
                        callback(null, new Error('Error whilst trying to save user: ' + newUser.emailAddress + ' ' + err));
                    } else {
                        callback(newUser);
                    }
                });
            }
        });
    }

    getUsers(callback) {
        this.userDao.find({}, function (err, users) {
            if(err){
                callback(null, err);
            }else{
                let userArray = [];
                users.forEach(function (user) {
                    userArray.push(user);
                });
                callback(userArray);
            }
        });
    }

    updateUser() {

    }

    deleteUser(id, callback) {
        this.userDao.findOne({_id: id}, function (err, user) {
            if (err)
                callback(false, err);
            else {
                if (user) {
                    user.remove(function (err) {
                        if (err) {
                            callback(false, new Error('Error whilst trying to remove user: ' + userEmail + ' ' + err));
                        } else {
                            callback(true);
                        }
                    });
                } else {
                    callback(false, new Error('Id does not exist'))
                }
            }
        });
    }
}

module.exports = new UserRepository();