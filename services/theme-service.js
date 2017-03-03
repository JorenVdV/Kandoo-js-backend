/**
 * Created by Seger on 8/02/2017.
 */

const Theme = require('../models/theme');
const replaceUndefinedOrNullOrEmptyObject = require('../_helpers/replacers');

class ThemeService {
    constructor() {
        this.themeRepo = require('../repositories/theme-repository');
        this.userService = require('../services/user-service');
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

    async changeTheme(id, toUpdate) {
        toUpdate = await this.validateUpdate(toUpdate);
        return await this.themeRepo.updateTheme(id, toUpdate);
    }

    async validateUpdate(toUpdate) {
        return JSON.parse(JSON.stringify(toUpdate, replaceUndefinedOrNullOrEmptyObject));
    }

    async addOrganiser(id, organiserEmail) {
        let organiser = await this.userService.getUserByEmail(organiserEmail);
        let theme = await this.getTheme(id);
        theme.organisers.push(organiser);
        return await this.changeTheme(theme._id, {organisers: theme.organisers});
    }

    async removeOrganiser(id, organiserId) {
        let theme = await this.getTheme(id);
        let index = theme.organisers.findIndex(org => org._id.toString() == organiserId.toString());
        theme.organisers.splice(index, 1);
        return await this.changeTheme(theme._id, {organisers: theme.organisers});
    }

    async removeTheme(themeId) {
        let theme = await this.getTheme(themeId);
        return await this.themeRepo.deleteTheme(theme);
    }
}

module.exports = new ThemeService();