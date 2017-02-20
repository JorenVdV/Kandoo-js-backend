/**
 * Created by Seger on 8/02/2017.
 */

var Theme = require('../models/theme');

class ThemeService {
    constructor() {
        this.themeRepo = require('../repositories/theme-repository');
    }

    addTheme(title, description, tags, isPublic, organiser, cards = [], callback) {
        let theme = new Theme();
        theme.title = title;
        theme.description = description;
        theme.tags = tags;
        theme.isPublic = isPublic;
        theme.organisers = [organiser];
        theme.cards = cards;

        this.themeRepo.createTheme(theme, function (theme, err) {
            if (err)
                callback(null, err);
            else
                callback(theme);
        });
    }

    getTheme(themeId, callback) {
        this.themeRepo.readThemeById(themeId, function (theme, err) {
            if (err)
                callback(null, err);
            else
                callback(theme);
        });
    }

    getThemes(callback) {
        this.themeRepo.readThemes(function (themes, err) {
            if (err)
                callback(null, err);
            else
                callback(themes);
        });
    }

    changeTheme(themeId, title, description, tags, isPublic, cards, callback) {
        this.themeRepo.updateTheme(themeId, title, description, tags, isPublic, cards, function (theme, err) {
            if (err)
                callback(null, err);
            else
                callback(theme);
        })
    }

    removeTheme(themeId, callback) {
        this.themeRepo.deleteTheme(themeId, function (success, err) {
            if (!success && err) {
                callback(success, err);
            } else if (err) {
                callback(err);
            } else {
                callback(success);
            }
        });
    }

    addCard(themeId, card, callback) {
        this.getTheme(themeId, function(theme, err){
            if(err) console.log(err);
            else {
                if (theme) {
                    theme.cards.push(card);
                    callback(theme);
                }
            }
        });
    }
}

module.exports = new ThemeService();