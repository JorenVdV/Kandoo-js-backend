/**
 * Created by nick on 10/02/17.
 */
var Card = require('../models/card');

class CardService {
    constructor() {
        this.repo = require('../repositories/card-repository');
    }

    getCards() {
        return [];
    }

    addCard(description) {
        return this.repo.createCard(description);
    }

}

module.exports = new CardService();