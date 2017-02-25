/**
 * Created by Seger on 8/02/2017.
 */

const Theme = require('../models/theme');

class ThemeService {
    constructor() {
        this.themeRepo = require('../repositories/theme-repository');
    }

    async addTheme(title, description, tags, isPublic, organiser, cards = []) {
        let theme = new Theme();
        theme.title = title;
        theme.description = description;
        theme.tags = tags;
        theme.isPublic = isPublic;
        theme.organisers = [organiser];
        theme.cards = cards;

        return await this.themeRepo.createTheme(theme);
    }

    async getTheme(themeId) {
        return await this.themeRepo.readThemeById(themeId);
    }

    async getThemes(organiserId = null) {
        return await this.themeRepo.readThemes(organiserId);
    }

    async changeTheme(themeId, title, description, tags, isPublic, cards) {
        return await this.themeRepo.updateTheme(themeId, title, description, tags, isPublic, cards);
    }

    async removeTheme(themeId) {
        let theme = await this.getTheme(themeId);
        return await this.themeRepo.deleteTheme(theme);
    }
}

module.exports = new ThemeService();