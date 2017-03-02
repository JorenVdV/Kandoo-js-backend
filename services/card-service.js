/**
 * Created by nick on 10/02/17.
 */
var Card = require('../models/card');
var themeService = require('../services/theme-service');
class CardService {
    constructor() {
        this.cardRepo = require('../repositories/card-repository');
    }

    async addCard(description, themeId) {
        let theme = await themeService.getTheme(themeId);

        let card = new Card();
        card.description = description;
        card.theme = theme;
        return await this.cardRepo.createCard(card);
    }

    async getCardById(cardId) {
        return await this.cardRepo.readCardById(cardId);
    }

    async getCardByThemeId(themeId) {
        return await this.cardRepo.readCardsByTheme(themeId);
    }

    async removeCard(cardId) {
        let card = await this.cardRepo.readCardById(cardId);
        return await this.cardRepo.deleteCard(card);
    }

}

module.exports = new CardService();