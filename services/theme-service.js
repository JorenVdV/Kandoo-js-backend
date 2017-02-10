/**
 * Created by Seger on 8/02/2017.
 */

var Theme = require('../models/theme');

class ThemeService {
    constructor() {
        this.repo = require('../repositories/theme-repository');
    }

    addTheme(title, description, tags, isPublic, organiser, cards) {
        return this.repo.createTheme(title, description, tags, isPublic, organiser, cards);
    }

    getTheme(themeId) {
        return this.repo.readTheme(themeId);
    }

    getThemes() {
        return this.repo.readThemes();
    }

    updateTheme(themeId, title, description, tags, isPublic, organiser, cards) {
        return this.repo.updateTheme(themeId, title, description, tags, isPublic, organiser, cards)
    }

    removeTheme(themeId) {
        this.repo.deleteTheme(themeId);
    }
}

module.exports = new ThemeService();