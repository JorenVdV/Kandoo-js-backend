class UserService {
    
    checkLogin() {
        return true;
    }
    
    getId(username){
        return 1;
    }
    
}

module.exports = new UserService();