/**
 * Created by Seger on 8/02/2017.
 */

var Theme = require('../models/theme');

class ThemeService {
    constructor() {
        this.repo = require('../repositories/theme-repository');
    }

    addTheme(title, description, tags, isPublic, organiser, cards) {
        let theme = new Theme();
        theme.title = title;
        theme.description = description;
        theme.tags = tags;
        theme.isPublic = isPublic;
        theme.organisers = [organiser];
        theme.cards = cards;
        return this.repo.createTheme(theme);
    }

    getTheme(themeId) {
        return this.repo.readThemeById(themeId);
    }

    getThemes() {
        return this.repo.readThemes();
    }

    changeTheme(themeId, title, description, tags, isPublic, organiser, cards) {
        return this.repo.updateTheme(themeId, title, description, tags, isPublic, organiser, cards)
    }

    removeTheme(themeId) {
        this.repo.deleteTheme(themeId);
    }
}

module.exports = new ThemeService();