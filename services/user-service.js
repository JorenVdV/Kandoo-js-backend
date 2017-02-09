
const User = require('../models/user');

class UserService {

    constructor(){
        this.repo = require('../repositories/user-repository');
    }

    createUser(firstname, lastname, emailAddress, organisation, password){
        let user = new User();
        user.firstname = firstname;
        user.lastname = lastname;
        user.emailAddress = emailAddress;
        user.organisation = organisation;
        user.password = password;

        return this.repo.createUser(user);
    }

    removeUser(id){
        this.repo.deleteUser(id);
    }

    findUserById(id){
        return this.repo.getUserById(id);
    }

    findUserByEmail(email){
        return this.repo.getUserByEmail(email);
    }


    checkLogin() {
        return true;
    }
    
    getId(username){
        return 1;
    }
    
}

module.exports = new UserService();