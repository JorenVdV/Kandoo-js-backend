/**
 * Created by nick on 10/02/17.
 */
var Card = require('../models/card');
var themeService = require('../services/theme-service');
class CardService {
    constructor() {
        this.cardRepo = require('../repositories/card-repository');
    }

    async addCard(description, themeId, callback) {
        let theme = await themeService.getTheme(themeId);

        let card = new Card();
        card.description = description;
        card.theme = theme;
        this.cardRepo.createCard(card,
            (card, err) => {
                if (err) {
                    callback(null, err);
                } else {
                    callback(card);
                }
            });


    }

    getCardById(cardId, callback) {
        this.cardRepo.readCardById(cardId,
            (card, err) => {
                if (err)
                    callback(null, err);
                else
                    callback(card);
            });
    }

    getCardByThemeId(themeId, callback) {
        this.cardRepo.readCardsByTheme(themeId,
            (cards, err) => {
                if (err)
                    callback(null, err);
                else
                    callback(cards);
            });
    }

    removeCard(cardId, callback) {
        this.cardRepo.deleteCard(cardId,
            (success, err) => {
                if (err)
                    callback(success, err);
                else
                    callback(success);
            });
    }

}

module.exports = new CardService();