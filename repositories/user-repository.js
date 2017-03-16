const User = require('../models/user');

class UserRepository {
    constructor() {
        this.userDao = User;
    }

    async readUserById(id) {
        let user;
        try {
            user = await this.userDao.findOne({_id: id}).populate('websockets');
        } catch (err) {
            throw new Error('Unexpected error occurred. ' + err);
        }

        if (user)
            return user;
        else
            throw new Error('Unable to find user with id: ' + id);
    }

    async readUserByEmail(email) {
        let user;
        try {
            user = await this.userDao.findOne({emailAddress: email});
        } catch (err) {
            throw new Error('Unexpected error occurred. ' + err);
        }

        if (user)
            return user;
        else
            throw new Error('Unable to find user with email: ' + email);

    }

    async createUser(newUser) {
        try {
            await newUser.save();
        } catch (err) {
            throw new Error('Unexpected error occurred. ' + err);
        }

        return newUser;
    }

    async readUsers() {
        let users;
        try {
            users = await this.userDao.find({});
        } catch (err) {
            throw new Error('Unexpected error occurred. ' + err);
        }

        let userArray = [];
        users.forEach((user) => {
            userArray.push(user);
        });
        return userArray;
    }

    async updateUser(id, toUpdate) {
        let user;
        try{
            user = await this.userDao.findByIdAndUpdate(id, toUpdate, {new:true});
        }catch(err){
            throw new Error('Unexpected error occurred. ' + err);
        }
        return user;
    }

    async deleteUser(user) {
        try {
            await user.remove();
        } catch (err) {
            throw new Error('Unexpected error occurred. ' + err);
        }
        return true;
    }

}

module.exports = new UserRepository();