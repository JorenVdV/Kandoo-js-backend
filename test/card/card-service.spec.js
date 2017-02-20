/**
 * Created by nick on 10/02/17.
 */
process.env.NODE_ENV = 'test';

const chai = require('chai');
const assert = chai.assert;

const Card = require('../../models/card');
const cardService = require('../../services/card-service');

describe('Card service tests', function () {


    it('initial there should be no cards', function () {
        var cards = cardService.getCards();
        assert(Array.isArray(cards), 'cards should always return an array');
        assert.equal(cards.length, 0, 'there should be no cards in the list');
    });

    it('add a card', function () {
        var card = cardService.addCard('This is a description.');

        assert.isDefined(card, 'The card exists.');
        assert.equal(card.description, 'This is a description.', 'The description should match.')
    });

    it('should find a card', function () {

        var card = cardService.addCard('This is a description.');

        var card2 = cardService.find(card._id);

        assert.isDefined(card2, 'It should be defined');
        assert.strictEqual(card._id, card2._id, 'The two ID\'s should be the same.');

    });

});