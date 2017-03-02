/**
 * Created by nick on 10/02/17.
 */
const Card = require('../models/card');

class CardRepository {
    constructor() {
        this.cardDao = Card;

    }

    async createCard(card) {
        try{
            await card.save();
        }catch(err){
            throw new Error('Unexpected error occurred. ' + err);
        }
        return card;
    }

    async readCardById(id) {
        let card;
        try {
            card = await this.cardDao.findOne({_id: id});
        } catch (err) {
            throw new Error('Unexpected error occurred. ' + err);
        }
        if(card){
            return card;
        } else{
            throw new Error('Unable to find card with id: ' + id);
        }
    }

    async readCardsByTheme(themeId) {
        let cards;
        try {
            cards = await this.cardDao.find({theme: themeId});
        } catch (err) {
            throw new Error('Unexpected error occurred. ' + err);
        }

        let cardsArray = [];
        cards.forEach((card) => {
            cardsArray.push(card);
        });
        return cardsArray;
    }

    async updateCard(id, toUpdate) {
        let card;
        try{
            card = await this.cardDao.findByIdAndUpdate(id, toUpdate);
        }catch(err){
            throw new Error('Unexpected error occurred. ' + err);
        }
        return card;
    }

    async deleteCard(card) {
        try {
            await card.remove();
        } catch (err) {
            throw new Error('Unexpected error occurred. ' + err);
        }
        return true;
    }
}

module.exports = new CardRepository();