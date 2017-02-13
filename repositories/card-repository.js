/**
 * Created by nick on 10/02/17.
 */
const Card = require('../models/card');

class CardRepository {
    constructor() {
        this.cardDao = [];

    }

    createCard(description) {
        let card = new Card();
        card.description = description;

        this.cardDao.push(card);

        return card;
    }
}

module.exports = new CardRepository();