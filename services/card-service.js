/**
 * Created by nick on 10/02/17.
 */
var Card = require('../models/card');

class CardService {
    constructor() {
        this.cardRepo = require('../repositories/card-repository');
    }

    getCards() {
        return [];
    }

    addCard(description) {
        return this.cardRepo.createCard(description);
    }

    find(cardId) {

        return this.cardRepo.readCardById(cardId);
    }

}

module.exports = new CardService();