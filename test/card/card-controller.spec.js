/**
 * Created by nick on 13/02/17.
 */
process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const assert = chai.assert;
const should = chai.should();
const server = require('../../app-test');
const userService = require('../../services/user-service');
const themeService = require('../../services/theme-service');
const cardService = require('../../services/card-service');

chai.use(chaiHttp);

require('../global');

describe('Card Controller tests', function () {
    let testUser;
    let testTheme;
    before('Initialise test user',async () => {
        testUser = await userService.createUser('Jos', 'Nikkel', 'jos.nikkel@teamjs.xyz', 'Karel de Grote Hogeschool - TeamJS', 'myAwesomePassword.123');
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

    describe('/POST /theme/{themeId}/card', () => {
        let add_card;

        it('Add a card', (done) => {
            let card = {
                description: 'Test description',
            };

            chai.request(server)
                .post('/theme/' + testTheme._id + '/card')
                .send(card)
                .end((err, res) => {
                    res.should.have.status(201);
                    add_card = res.body.card;
                    assert.strictEqual(add_card.description, 'Test description');
                    assert.equal(add_card.theme._id, testTheme._id);
                    done();
                });
        });

        after('Remove the card', (done) => {
            cardService.removeCard(add_card._id,
                (success, err) => {
                    assert.isNotOk(err);
                    assert.isTrue(success);
                    done();
                });
        });
    });

    describe('/DELETE /card/:cardId/delete', () => {
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
            chai.request(server)
                .delete('/card/' + remove_card._id + '/delete')
                .send()
                .end((err, res) => {
                    res.should.have.status(204);
                    done();
                });
        });

        it('Remove a non existing card', (done) => {
            chai.request(server)
                .delete('/card/' + '00aa0aa000a000000a0000aa' + '/delete')
                .send()
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.should.have.property('error');

                    assert.strictEqual(res.body.error, "Unable to find card with id " + '00aa0aa000a000000a0000aa');
                    done();
                });
        });
    });

    describe('/GET /card/:cardId', () => {
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
            chai.request(server)
                .get('/card/' + get_card._id)
                .send()
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.property('card');

                    assert.strictEqual(res.body.card.description, 'Test card with a test description');
                    done();
                });
        });

        it('Get a non existing card', (done) => {
            chai.request(server)
                .get('/card/' + '00aa0aa000a000000a0000aa')
                .send()
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.should.have.property('error');

                    assert.strictEqual(res.body.error, "Unable to find card with id " + '00aa0aa000a000000a0000aa');
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

    describe('/GET /theme/:themeId/cards', () => {
        it('Get cards - no existing cards', (done) => {
            chai.request(server)
                .get('/theme/' + testTheme._id + '/cards')
                .send()
                .end((err, res) => {

                    res.should.have.status(200);
                    res.body.should.have.property('cards');

                    assert.strictEqual(res.body.cards.length, 0);
                    done();
                })
        });

        describe('Get cards - a single existing card', () => {
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
                chai.request(server)
                    .get('/theme/' + testTheme._id + '/cards')
                    .send()
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.have.property('cards');

                        assert.strictEqual(res.body.cards.length, 1);
                        assert.isOk(res.body.cards[0]._id.toString(), get_all_card._id.toString());

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

        describe('Get cards - two existing cards', () => {
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

            before('Create a card',
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
                chai.request(server)
                    .get('/theme/' + testTheme._id + '/cards')
                    .send()
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.have.property('cards');
                        assert.strictEqual(res.body.cards.length, 2);
                        let cardsToId = res.body.cards.map((card) => card._id.toString());
                        assert.isOk(cardsToId.includes(get_all_card1._id.toString()));
                        assert.isOk(cardsToId.includes(get_all_card2._id.toString()));

                        done();
                    })
            });

            after('Remove the card', (done) => {
                cardService.removeCard(get_all_card1._id,
                    (success, err) => {
                        assert.isNotOk(err);
                        assert.isTrue(success);
                        done();
                    });
            });

            after('Remove the card', (done) => {
                cardService.removeCard(get_all_card2._id,
                    (success, err) => {
                        assert.isNotOk(err);
                        assert.isTrue(success);
                        done();
                    });
            });
        });

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