
process.env.NODE_ENV = 'test';

const chai = require('chai');
const assert = chai.assert;

var themeService = require('../../services/theme-service');
var cardService = require('../../services/card-service');
var userService = require('../../services/user-service');

describe("theme service tests", function () {
    let user1;
    let user2;

    before('Creating the users user1', async function () {
        user1 = await userService.createUser("User1", "Test", "user1.test@teamjs.xyz", "TeamJS", "pwd");
        assert.isOk(user1);

        user2 = await userService.createUser("User2", "Test", "user2.test@teamjs.xyz", "TeamJS", "pwd");
        assert.isOk(user2);
    });

    it('Creating a theme', function (done) {
        themeService.addTheme('first theme', 'a description', [], true, user1, null, function (theme, err) {
            assert.isNotOk(err);
            assert.isOk(theme);

            assert.strictEqual(theme.title, 'first theme', 'the title of the theme should be "first theme"');
            assert.strictEqual(theme.description, 'a description', 'the description of the theme should be "a description"');
            assert(Array.isArray(theme.tags), 'the tags of the theme should be an empty array');
            assert.strictEqual(theme.isPublic, true, 'the theme should be public');
            assert(theme.organisers.includes(user1), 'the theme should contain its creator');
            assert.strictEqual(theme.organisers.length, 1, 'the theme should only contain one organiser at this moment');

            themeService.removeTheme(theme._id, function (success, err) {
                assert.isNotOk(err);
                assert.isTrue(success);

                done();
            });
        });
    });

    describe('Remove a theme', function () {
        let removeTheme_theme;
        before('Create a theme to remove', function (done) {
            themeService.addTheme('first theme', 'a description', [], true, user1, null, function (theme, err) {
                assert.isNotOk(err);
                assert.isOk(theme);
                removeTheme_theme = theme;
                done();
            });
        });

        it('Remove a theme - existing id', function (done) {
            themeService.removeTheme(removeTheme_theme._id, function (success, err) {
                assert.isNotOk(err);
                assert.isTrue(success);

                done();
            });
        });

        it('Remove a theme - non existent id', function (done) {
            themeService.removeTheme('00aa0aa000a000000a0000aa', function (success, err) {
                assert.isOk(err);
                assert.isFalse(success);

                assert.strictEqual(err.message, 'Id does not exist');
                done();
            });
        });
    });

    describe('Update a theme', function () {
        let updateTheme_theme;
        before('Create a theme to remove', function (done) {
            themeService.addTheme('first theme', 'a description', [], true, user1, null, function (theme, err) {
                assert.isNotOk(err);
                assert.isOk(theme);
                updateTheme_theme = theme;
                done();
            });
        });

        it('Update the theme', function (done) {
            themeService.changeTheme(updateTheme_theme._id, updateTheme_theme.title, "new description", updateTheme_theme.tags, false, updateTheme_theme.cards, function (success, err) {
                assert.isNotOk(err);
                assert.isOk(success);
                done();
            });
        });

        it('Check updated theme', function(done){
            themeService.getTheme(updateTheme_theme._id, function(theme, err){
                assert.isNotOk(err);
                assert.isOk(theme);

                assert.strictEqual(theme.title, updateTheme_theme.title);
                assert.strictEqual(theme.description, "new description");
                assert.strictEqual(theme.tags.length, updateTheme_theme.tags.length);
                assert.strictEqual(theme.isPublic, false);
                assert.strictEqual(theme.organisers.length, 1);
                done();
            });
        });

        after('Remove the theme', function (done) {
            themeService.removeTheme(updateTheme_theme._id, function (success, err) {
                assert.isNotOk(err);
                assert.isTrue(success);

                done();
            });
        });
    });

    // it('adds a card to a theme', function () {
    //     var card = cardService.addCard('This is a description');
    //
    //     var theme1 = themeService.addTheme("first theme", "a description", [], true, user1);
    //     theme1.populate('cards');
    //
    //     themeService.addCard(theme1._id, card);
    //
    //     assert.isArray(theme1.cards, 'Should be an array');
    //     assert.lengthOf(theme1.cards, 1, 'The amount of cards should be 1');
    //     assert.equal(theme1.cards[0], card._id, 'The id should be equal to the cards\' id');
    // });

    after('Remove users', async function () {
        let successful = await userService.removeUser(user1._id);
        assert.isTrue(successful);

        successful = await userService.removeUser(user2._id);
        assert.isTrue(successful);
    });


});