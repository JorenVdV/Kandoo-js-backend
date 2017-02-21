const User = require('../models/user');

class UserRepository {
    constructor() {
        this.userDao = User;
    }

    readUserById(id, callback) {
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

    readUserByEmail(email, callback) {
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

    readUsers(callback) {
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
                            callback(false, new Error('Error whilst trying to remove user with id : ' + id + ' ' + err));
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

    // promise_getUserById(id){
    //     return this.userDao.findOne({'_id': id}, function (err, user) {
    //         if (err) {
    //             throw new Error('Error trying to find user with id: ' + id + ' ' + err);
    //         } else {
    //             if (user)
    //                 return user;
    //             else
    //                 throw new Error('Unable to find user with id: ' + id);
    //         }
    //     });
    // }
    // promise_getUserByEmail(email){
    //     return this.userDao.findOne({emailAddress: email}, function (err, user) {
    //         if (err) {
    //             throw new Error('Error trying to find user with email: ' + email + ' ' + err);
    //         } else {
    //             if (user)
    //                 return user;
    //             else
    //                 throw new Error('Unable to find user with email: ' + email);
    //         }
    //     });
    // }
    // promise_deleteUser(user){
    //     return user.remove(function(err){
    //        if(err){
    //            throw new Error('Error whilst trying to remove user: ' + userEmail + ' ' + err);
    //        } else{
    //            return true;
    //        }
    //     });
    // }
}

module.exports = new UserRepository();