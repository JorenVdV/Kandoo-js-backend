/**
 * Created by nick on 10/02/17.
 */
const Card = require('../models/card');

class CardRepository {
    constructor() {
        this.cardDao = Card;

    }

    createCard(card, callback) {
        card.save((err) => {
            if (err)
                callback(null, new Error('Error whilst creating card'));
            else
                callback(card);
        });
    }

    readCardById(id, callback) {
        this.cardDao.findOne({_id: id}, (err, card) => {
            if (err) {
                callback(null, err);
            } else {
                if (card) {
                    callback(card);
                } else {
                    callback(null, new Error('Unable to find card with id ' + id));
                }
            }
        });
    }

    readCardsByTheme(themeId, callback) {
        this.cardDao.find({theme: themeId}, (err, cards) => {
            if (err) {
                callback(null, err);
            } else {
                let cardsArray = [];
                cards.forEach((card) => cardsArray.push(card));
                callback(cards);
            }
        });
    }

    deleteCard(cardId, callback) {
        this.cardDao.remove({_id: cardId}, (err, affected) => {
           if(err){
               callback(false, err);
           } else {
               if(affected.result.n === 1){
                   callback(true)
               } else if(affected.result.n === 0){
                   callback(false, new Error('Unable to find card with id ' + cardId));
               }
           }
        });
    }
}

module.exports = new CardRepository();