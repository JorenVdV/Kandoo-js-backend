process.env.NODE_ENV = 'test';

const chai = require('chai');
const assert = chai.assert;

const themeService = require('../../services/theme-service');
const userService = require('../../services/user-service');

describe("theme service tests", function () {
    let user1;
    let user2;

    before('Creating the users user1', async function () {
        user1 = await userService.addUser("User1", "Test", "user1.test@teamjs.xyz", "TeamJS", "pwd");
        assert.isOk(user1);

        user2 = await userService.addUser("User2", "Test", "user2.test@teamjs.xyz", "TeamJS", "pwd");
        assert.isOk(user2);
    });

    it('Creating a theme', async function () {
        let theme = await themeService.addTheme('first theme', 'a description', [], true, user1, null);
        assert.isOk(theme);

        assert.strictEqual(theme.title, 'first theme', 'the title of the theme should be "first theme"');
        assert.strictEqual(theme.description, 'a description', 'the description of the theme should be "a description"');
        assert(Array.isArray(theme.tags), 'the tags of the theme should be an empty array');
        assert.strictEqual(theme.isPublic, true, 'the theme should be public');
        assert(theme.organisers.includes(user1), 'the theme should contain its creator');
        assert.strictEqual(theme.organisers.length, 1, 'the theme should only contain one organiser at this moment');

        let successful = await themeService.removeTheme(theme._id);
        assert.isTrue(successful);
    });

    describe('Remove a theme', function () {
        let removeTheme_theme;
        before('Create a theme to remove', async function () {
            removeTheme_theme = await themeService.addTheme('first theme', 'a description', [], true, user1, null);
            assert.isOk(removeTheme_theme);
        });

        it('Remove a theme - existing id', async function () {
            let successful = await themeService.removeTheme(removeTheme_theme._id);
            assert.isTrue(successful);
        });

        it('Remove a theme - non existing id', async function () {
            try {
                let successful = await themeService.removeTheme('00aa0aa000a000000a0000aa');
                assert.isNotOk(successful);
            } catch (err) {
                assert.isOk(err);
                assert.strictEqual(err.message, 'Unable to find theme with id: ' + '00aa0aa000a000000a0000aa');
            }
        });
    });

    describe('Get all themes', () => {

        it('Retrieve all themes - no existing themes', async () => {
            let themes = await themeService.getThemes();
            assert.isOk(themes);
            assert.isArray(themes);
            assert.strictEqual(themes.length,0);
        });

        describe('Retrieve all themes - one existing theme', () => {
            let get_all_themes;
            before('Create a theme', async () => {
                get_all_themes = await themeService.addTheme('first theme', 'a description', [], true, user1, null);
                assert.isOk(get_all_themes);
            });

            it('Retrieve all themes - one existing theme', async () => {
                let themes = await themeService.getThemes();
                assert.isOk(themes);
                assert.isArray(themes);
                assert.strictEqual(themes.length,1);
                assert.strictEqual(themes[0]._id.toString(), get_all_themes._id.toString());
            });

            after('Remove the theme', async () => {
                let successful = await themeService.removeTheme(get_all_themes._id);
                assert.isTrue(successful);
            });
        });

        describe('Retrieve all themes - two existing themes', () => {
            let get_all_themes1;
            let get_all_themes2;
            before('Create the themes', async () => {
                get_all_themes1 = await themeService.addTheme('first theme', 'a description', [], true, user1, null);
                assert.isOk(get_all_themes1);
                get_all_themes2 = await themeService.addTheme('second theme', 'a description', [], true, user2, null);
                assert.isOk(get_all_themes2);
            });

            it('Retrieve all themes - two existing themes', async () => {
                let themes = await themeService.getThemes();
                assert.isOk(themes);
                assert.isArray(themes);
                assert.strictEqual(themes.length,2);
                let themesToId = themes.map(theme => theme._id.toString());
                assert.isTrue(themesToId.includes(get_all_themes1._id.toString()));
                assert.isTrue(themesToId.includes(get_all_themes2._id.toString()));
            });

            it('Retrieve all themes - one existing theme per creator', async() => {
                let themesUser1 = await themeService.getThemes(user1._id);
                assert.isOk(themesUser1);
                assert.isArray(themesUser1);
                assert.strictEqual(themesUser1.length,1);
                assert.strictEqual(themesUser1[0]._id.toString(), get_all_themes1._id.toString());

                let themesUser2 = await themeService.getThemes(user2._id);
                assert.isOk(themesUser2);
                assert.isArray(themesUser2);
                assert.strictEqual(themesUser2.length,1);
                assert.strictEqual(themesUser2[0]._id.toString(), get_all_themes2._id.toString());
            });

            after('Remove the themes', async () => {
                let successful = await themeService.removeTheme(get_all_themes1._id);
                assert.isTrue(successful);
                successful = await themeService.removeTheme(get_all_themes2._id);
                assert.isTrue(successful);
            });
        });

    });

    describe('Update a theme - ', function () {
        let update_theme;
        let anotherUser;
        before('Create a theme to remove', async function () {
            update_theme = await themeService.addTheme('first theme', 'a description', ['a tag'], true, user1, null);
            assert.isOk(update_theme);

            anotherUser = await userService.addUser('bla', 'bla', 'bla@bla.com', 'bla', 'bla');
            assert.isOk(anotherUser);
        });

        it('Update the title and description', async function () {
            let updates = {title: "Fun new Title", description: "testDescription"};
            let theme = await themeService.changeTheme(update_theme._id, updates);
            assert.isOk(theme);
            assert.strictEqual(theme.title, "Fun new Title");
            assert.strictEqual(theme.description, "testDescription");
            assert.strictEqual(theme.tags.length, 1);
            assert.strictEqual(theme.tags[0], 'a tag');

            update_theme = theme;
        });

        it('Update the theme - add two tags', async function () {
            let tags = update_theme.tags;
            tags.push('another tag', 'third tag');
            let updates = {tags: tags};
            let theme = await themeService.changeTheme(update_theme._id, updates);
            assert.isOk(theme);
            assert.strictEqual(theme.title, update_theme.title);
            assert.strictEqual(theme.description, update_theme.description);
            assert.strictEqual(theme.tags.length, 3);
            assert.strictEqual(theme.tags[0], 'a tag');
            assert.strictEqual(theme.tags[1], 'another tag');
            assert.strictEqual(theme.tags[2], 'third tag');

            update_theme = theme;
        });

        it('Update the theme - add organiser', async function () {
            let theme = await themeService.addOrganiser(update_theme._id, anotherUser.emailAddress);
            assert.isOk(theme);
            let organisers = theme.organisers.map(organiser => organiser._id.toString());
            assert.isTrue(organisers.includes(anotherUser._id.toString()));

            update_theme = theme;
        });

        it('Update the theme - remove organiser', async function () {
            let theme = await themeService.removeOrganiser(update_theme._id, anotherUser._id);
            assert.isOk(theme);
            let organisers = theme.organisers.map(organiserId => organiserId.toString());
            assert.isFalse(organisers.includes(anotherUser._id.toString()));

            update_theme = theme;
        });

        after('Remove the theme & second user', async function () {
            let successful = await themeService.removeTheme(update_theme._id);
            assert.isTrue(successful);
            successful = await userService.removeUser(anotherUser._id);
            assert.isTrue(successful);
        });
    });

    after('Remove users', async function () {
        let successful = await userService.removeUser(user1._id);
        assert.isTrue(successful);

        successful = await userService.removeUser(user2._id);
        assert.isTrue(successful);
    });


});