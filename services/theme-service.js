/**
 * Created by Seger on 8/02/2017.
 */

var Theme = require('../models/theme')
    
class ThemeService {
    constructor() {
        this.repo = require('../repositories/theme-repository');
        this.userService = require('./user-service')
    }

    addTheme(title, description, tags, isPublic, organiser, cards) {
        return this.repo.createTheme(title, description, tags, isPublic, organiser, cards);
    }

    getTheme(user, id) {
        var theme = this.repo.readTheme(id);
        return theme.organisers.contains(user) ? theme : null;
    }

    getThemes(organiser) {
        return this.repo.readThemes(organiser);
    }

    updateTheme(id, title, description, tags, isPublic, organiser, cards) {
        if(!this.getTheme(organiser, id)){
            //update
        }
    }

    removeTheme(user, id) {
        //if(!this.getTheme(user, id)){
            this.repo.deleteTheme(id);
        //}
    }
}

module.exports = new ThemeService();