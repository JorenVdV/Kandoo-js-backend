/**
 * Created by nick on 10/02/17.
 */
const config = require('../../_config');
const mongoose = require('mongoose');
process.env.NODE_ENV = 'test';

const chai = require('chai');
const assert = chai.assert;

const Card = require('../../models/card');
const cardService = require('../../services/card-service');

describe('Card service tests', function () {
    before('Open connection to test database', function(done){
        if(mongoose.connection.readyState === 0){
            mongoose.connect(config.mongoURI[process.env.NODE_ENV],function(err){
                if(err){
                    console.log('Error connecting to the database. ' + err);
                } else{
                    console.log('Connected to database: ' + config.mongoURI[process.env.NODE_ENV]);
                }
                done();
            });
        }else {
            console.log("Already connected to mongodb://" + mongoose.connection.host + ":" + mongoose.connection.port + "/" + mongoose.connection.name);
            done();
        }
    });

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

    after('Closing connection to test database', function(done){
        mongoose.disconnect();
        done();
    });
});