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

require('../global');

describe('Card service tests', function () {
    let testUser;
    let testTheme;

    before('Initialise test user', async () => {
        testUser = await userService.createUser('Jos', 'Nikkel', 'jos.nikkel1@teamjs.xyz', 'Karel de Grote Hogeschool - TeamJS', 'myAwesomePassword.123');
        assert.isOk(testUser);
    });

    before('Initialise test theme', (done) => {
        themeService.addTheme('first theme', 'a description', [], true, testUser, null, function (theme, err) {
            assert.isNotOk(err);
            assert.isOk(theme);
            testTheme = theme;
            done();
        });
    });

    it('Add a card', (done) => {
        cardService.addCard('Test card with a test description', testTheme,
            (card, err) => {
                assert.isNotOk(err);
                assert.isOk(card);

                assert.strictEqual(card.description, 'Test card with a test description');
                assert.strictEqual(card.theme._id.toString(), testTheme._id.toString());

                cardService.removeCard(card._id,
                    (success, err) => {
                        assert.isNotOk(err);
                        assert.isTrue(success);
                        done();
                    });
            });
    });

    describe('Get a card', () => {
        let get_card;
        before('Create a card',
            (done) => {
                cardService.addCard('Test card with a test description', testTheme,
                    (card, err) => {
                        assert.isNotOk(err);
                        assert.isOk(card);
                        get_card = card;
                        done();
                    });
            });

        it('Get an existing card', (done) => {
            cardService.getCardById(get_card._id,
                (card, err) => {
                    assert.isNotOk(err);
                    assert.isOk(card);

                    assert.strictEqual(card._id.toString(), get_card._id.toString());

                    done();
                });
        });

        it('Get a non-existing card', (done) => {
            cardService.getCardById('00aa0aa000a000000a0000aa',
                (card, err) => {
                    assert.isOk(err);
                    assert.isNotOk(card);

                    assert.strictEqual(err.message, "Unable to find card with id " + '00aa0aa000a000000a0000aa');

                    done();
                });
        });

        after('Remove the card', (done) => {
            cardService.removeCard(get_card._id,
                (success, err) => {
                    assert.isNotOk(err);
                    assert.isTrue(success);
                    done();
                });
        });
    });

    describe('Remove a card', () => {
        let remove_card;
        before('Create a card',
            (done) => {
                cardService.addCard('Test card with a test description', testTheme,
                    (card, err) => {
                        assert.isNotOk(err);
                        assert.isOk(card);
                        remove_card = card;
                        done();
                    });
            });

        it('Remove an existing card', (done) => {
            cardService.removeCard(remove_card._id,
                (success, err) => {
                    assert.isNotOk(err);
                    assert.isTrue(success);

                    done();
                });
        });

        it('Remove a non-existing card', (done) => {
            cardService.removeCard('00aa0aa000a000000a0000aa',
                (success, err) => {
                    assert.isOk(err);
                    assert.isFalse(success);

                    assert.strictEqual(err.message, "Unable to find card with id " + '00aa0aa000a000000a0000aa');

                    done();
                });
        });
    });

    describe('Get all cards of a theme', () => {

        it('Get all cards - no existing cards', (done) => {
            cardService.getCardByThemeId(testTheme._id,
                (cards, err) => {
                    assert.isNotOk(err);
                    assert.isOk(cards);
                    assert.isArray(cards);
                    assert.strictEqual(cards.length, 0);
                    done();
                })
        });

        describe('Get all cards - a single card', () => {
            let get_all_card;
            before('Create a card',
                (done) => {
                    cardService.addCard('Test card with a test description', testTheme,
                        (card, err) => {
                            assert.isNotOk(err);
                            assert.isOk(card);
                            get_all_card = card;
                            done();
                        });
                });

            it('Retrieve all cards', (done) => {
                cardService.getCardByThemeId(testTheme._id,
                    (cards, err) => {
                        assert.isNotOk(err);
                        assert.isOk(cards);
                        assert.isArray(cards);
                        assert.strictEqual(cards.length, 1);
                        assert.isOk(cards[0]._id.toString(), get_all_card._id.toString());
                        done();
                    })
            });

            after('Remove the card', (done) => {
                cardService.removeCard(get_all_card._id,
                    (success, err) => {
                        assert.isNotOk(err);
                        assert.isTrue(success);
                        done();
                    });
            });
        });

        describe('Get all cards - two cards', () => {
            let get_all_card1;
            let get_all_card2;
            before('Create a card',
                (done) => {
                    cardService.addCard('Test card with a test description', testTheme,
                        (card, err) => {
                            assert.isNotOk(err);
                            assert.isOk(card);
                            get_all_card1 = card;
                            done();
                        });
                });

            before('Create a second card',
                (done) => {
                    cardService.addCard('Test card with another test description', testTheme,
                        (card, err) => {
                            assert.isNotOk(err);
                            assert.isOk(card);
                            get_all_card2 = card;
                            done();
                        });
                });

            it('Retrieve all cards', (done) => {
                cardService.getCardByThemeId(testTheme._id,
                    (cards, err) => {
                        assert.isNotOk(err);
                        assert.isOk(cards);
                        assert.isArray(cards);
                        assert.strictEqual(cards.length, 2);
                        let cardsToId = cards.map((card) => card._id.toString());
                        assert.isOk(cardsToId.includes(get_all_card1._id.toString()));
                        assert.isOk(cardsToId.includes(get_all_card2._id.toString()));
                        done();
                    })
            });

            after('Remove the first card', (done) => {
                cardService.removeCard(get_all_card1._id,
                    (success, err) => {
                        assert.isNotOk(err);
                        assert.isTrue(success);
                        done();
                    });
            });

            after('Remove the second card', (done) => {
                cardService.removeCard(get_all_card2._id,
                    (success, err) => {
                        assert.isNotOk(err);
                        assert.isTrue(success);
                        done();
                    });
            });
        })
    });

    after('Remove test user', async () => {
        let successful = await userService.removeUser(testUser._id);
        assert.isTrue(successful);
    });

    after('Remove test theme', (done) => {
        themeService.removeTheme(testTheme._id, function (success, err) {
            assert.isNotOk(err);
            assert.isTrue(success);

            done();
        });
    });
});