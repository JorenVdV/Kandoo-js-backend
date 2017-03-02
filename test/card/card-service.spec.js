/**
 * Created by nick on 10/02/17.
 */
process.env.NODE_ENV = 'test';

const chai = require('chai');
const assert = chai.assert;

const Card = require('../../models/card');
const cardService = require('../../services/card-service');
const userService = require('../../services/user-service');
const themeService = require('../../services/theme-service');

describe('Card service tests', function () {
    let testUser;
    let testTheme;

    before('Initialise test user & test theme ', async() => {
        testUser = await userService.addUser('Jos', 'Nikkel', 'jos.nikkel1@teamjs.xyz', 'Karel de Grote Hogeschool - TeamJS', 'myAwesomePassword.123');
        assert.isOk(testUser);

        testTheme = await themeService.addTheme('first theme', 'a description', [], true, testUser, null);
        assert.isOk(testTheme);
    });

    it('Add a card', async() => {
        let card = await cardService.addCard('Test card with a test description', testTheme._id);

        assert.isOk(card);
        assert.strictEqual(card.description, 'Test card with a test description');
        assert.strictEqual(card.theme._id.toString(), testTheme._id.toString());
        let successful = await cardService.removeCard(card._id);
        assert.isTrue(successful);
    });

    describe('Get a card', () => {
        let get_card;
        before('Create a card',
            async() => {
                get_card = await cardService.addCard('Test card with a test description', testTheme._id);
                assert.isOk(get_card);
            });

        it('Get an existing card', async() => {
            let card = await cardService.getCardById(get_card._id);
            assert.isOk(card);
            assert.strictEqual(card._id.toString(), get_card._id.toString());
        });

        it('Get a non-existing card', async() => {
            try {
                let card = await cardService.getCardById('00aa0aa000a000000a0000aa');
                assert.isNotOk(card);
            } catch (err) {
                assert.isOk(err);
                assert.strictEqual(err.message, "Unable to find card with id: " + '00aa0aa000a000000a0000aa');
            }
        });

        after('Remove the card', async() => {
            let successful = await cardService.removeCard(get_card._id);
            assert.isTrue(successful);
        });
    });

    describe('Remove a card', () => {
        let remove_card;
        before('Create a card',
            async() => {
                remove_card = await cardService.addCard('Test card with a test description', testTheme._id);
                assert.isOk(remove_card);
            });

        it('Remove an existing card', async() => {
            let successful = await cardService.removeCard(remove_card._id);
            assert.isTrue(successful);
        });

        it('Remove a non-existing card', async() => {
            try {
                let successful = await cardService.removeCard('00aa0aa000a000000a0000aa');
                assert.isTrue(successful);
            } catch (err) {
                assert.isOk(err);
                assert.strictEqual(err.message, "Unable to find card with id: " + '00aa0aa000a000000a0000aa');
            }
        });
    });

    describe('Get all cards of a theme', () => {

        it('Get all cards - no existing cards', async() => {
            let cards = await cardService.getCardByThemeId(testTheme._id);
            assert.isOk(cards);
            assert.isArray(cards);
            assert.strictEqual(cards.length, 0);
        });

        describe('Get all cards - a single card', () => {
            let get_all_card;
            before('Create a card',
                async() => {
                    get_all_card = await cardService.addCard('Test card with a test description', testTheme._id);
                    assert.isOk(get_all_card);
                });

            it('Retrieve all cards', async() => {
                let cards = await cardService.getCardByThemeId(testTheme._id);
                assert.isOk(cards);
                assert.isArray(cards);
                assert.strictEqual(cards.length, 1);
                assert.isOk(cards[0]._id.toString(), get_all_card._id.toString());
            });

            after('Remove the card', async() => {
                let successful = await cardService.removeCard(get_all_card._id);
                assert.isTrue(successful);
            });
        });

        describe('Get all cards - two cards', () => {
            let get_all_card1;
            let get_all_card2;
            before('Create the cards',
                async() => {
                    get_all_card1 = await cardService.addCard('Test card with a test description', testTheme._id);
                    assert.isOk(get_all_card1);

                    get_all_card2 = await cardService.addCard('Test card with another test description', testTheme._id);
                    assert.isOk(get_all_card2);
                });


            it('Retrieve all cards', async() => {
                let cards = await cardService.getCardByThemeId(testTheme._id);
                assert.isOk(cards);
                assert.isArray(cards);
                assert.strictEqual(cards.length, 2);
                let cardsToId = cards.map((card) => card._id.toString());
                assert.isOk(cardsToId.includes(get_all_card1._id.toString()));
                assert.isOk(cardsToId.includes(get_all_card2._id.toString()));
            });

            after('Remove the cards', async() => {
                let successful = await cardService.removeCard(get_all_card1._id);
                assert.isTrue(successful);
                successful = await cardService.removeCard(get_all_card2._id);
                assert.isTrue(successful);
            });
        })
    });

    after('Remove test user & test theme', async() => {
        let successful = await userService.removeUser(testUser._id);
        assert.isTrue(successful);

        successful = await themeService.removeTheme(testTheme._id);
        assert.isTrue(successful);
    });
});