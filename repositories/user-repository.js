/**
 * Created by steve on 2/8/2017.
 */
const User = require('../models/user');

// class UserRepository {
//     constructor() {
//         this.userDao = User;
//     }
//
//     getUserById(id) {
//         return this.userDao.findOne({_id: id}, function(err, user){
//             if(err){
//                 throw new Error('Error trying to find user with id: ' + id + ' ' + err );
//             }
//             return user || false;
//         });
//     }
//
//     getUserByEmail(email) {
//         return this.userDao.find({emailAddress: email}, function(err,user){
//             if(err){
//                 throw new Error('Error trying to find user with email: ' + email + ' ' + err );
//             }
//             return user || false;
//         });
//     }
//
//     createUser(user) {
//         user.save(function(err){
//            if(err) {throw new Error('Error whilst trying to save user: ' + user.emailAddress + ' ' + err);}
//         });
//         return user;
//     }
//
//     getUsers(){
//         return this.userDao.find({}, function(err, users){
//             let userArray = [];
//             users.forEach(function(user){
//                 userArray.push(user);
//             });
//             return userArray;
//         });
//     }
//
//     updateUser() {
//
//     }
//
//     deleteUser(user) {
//         user.remove(function(err){
//             if(err){
//                 throw new Error('Error whilst trying to remove user: ' + user.emailAddress + ' ' + err);
//             }
//         });
//         // this.userDao.splice(this.userDao.findIndex(user => user._id == id),1);
//         return !this.getUserById(id);
//     }
// }

class UserRepository {
    constructor() {
        this.userDao = [];
    }

    getUserById(id) {
        return this.userDao.find(user => user._id == id);
    }

    getUserByEmail(email) {
        return this.userDao.find(user => user.emailAddress === email);
    }

    createUser(user) {
        this.userDao.push(user);
        return user;
    }

    getUsers(){
        return this.userDao;
    }

    updateUser() {

    }

    deleteUser(id) {
        this.userDao.splice(this.userDao.findIndex(user => user._id == id),1);
        return !this.getUserById(id);
    }
}

module.exports = new UserRepository();