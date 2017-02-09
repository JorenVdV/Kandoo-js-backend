/**
 * Created by steve on 2/8/2017.
 */
const Theme = require('../models/theme');

class ThemeRepository{
    constructor(){
        this.themeDao = [];
    }

    createTheme(title, description, tags, isPrivate, organiser, cards = []){
        let theme = new Theme();
        theme.title = title;
        theme.description = description;
        theme.tags = tags;
        theme.isPrivate = isPrivate;
        theme.organisers = [];
        theme.organisers.push(organiser);
        theme.cards = cards;

        this.themeDao.push(theme);
        return theme;
    }
    
    readTheme(id) {
        return this.themeDao.find(t=> t.id === id);
    }
    
    readThemes(organiser) {
        return this.themeDao
    }

    updateTheme(){

    }

    deleteTheme(id){
        this.themeDao.splice(this.themeDao.findIndex(theme => theme.id) === id,1);
    }
}

module.exports = new ThemeRepository();