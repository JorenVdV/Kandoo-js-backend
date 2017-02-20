/**
 * Created by steve on 2/8/2017.
 */
const Theme = require('../models/theme');

class ThemeRepository{
    constructor(){
        this.themeDao = [];
    }

    createTheme(theme){
        this.themeDao.push(theme);
        return theme;
    }
    
    readThemeById(id) {
        return this.themeDao.find(theme => theme._id == id);
    }
    
    readThemes() {
        return this.themeDao;
    }

    updateTheme(id, title, description, tags, isPublic, organiser, cards = []){
        var theme = this.readThemeById(id);
        theme.title = title;
        theme.description = description;
        theme.tags = tags;
        theme.isPublic = isPublic;
        theme.organisers = [organiser];
        theme.cards = cards;
        return theme
    }

    deleteTheme(id){
        this.themeDao.splice(this.themeDao.findIndex(theme => theme._id == id),1);
    }
}

module.exports = new ThemeRepository();