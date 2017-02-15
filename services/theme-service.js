/**
 * Created by Seger on 8/02/2017.
 */

var Theme = require('../models/theme');

class ThemeService {
    constructor() {
        this.themeRepo = require('../repositories/theme-repository');
    }

    addTheme(title, description, tags, isPublic, organiser, cards = []) {
        let theme = new Theme();
        theme.title = title;
        theme.description = description;
        theme.tags = tags;
        theme.isPublic = isPublic;
        theme.organisers = [organiser];
        theme.cards = cards;
        return this.themeRepo.createTheme(theme);
    }

    getTheme(themeId) {
        return this.themeRepo.readThemeById(themeId);
    }

    getThemes() {
        return this.themeRepo.readThemes();
    }

    changeTheme(themeId, title, description, tags, isPublic, organiser, cards) {
        return this.themeRepo.updateTheme(themeId, title, description, tags, isPublic, organiser, cards)
    }

    removeTheme(themeId) {
        this.themeRepo.deleteTheme(themeId);
    }

    addCard(themeId, card) {

        var theme = this.getTheme(themeId);

        theme.cards.push(card);
        return theme;
    }
}

module.exports = new ThemeService();