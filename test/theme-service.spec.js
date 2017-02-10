var chai = require('chai');
var assert = chai.assert;
var themeService = require('../services/theme-service');

describe("theme service tests", function(){
    let user1;
    let user2;
    before(function () {
        var userService =  require('../services/user-service');
        user1 = userService.createUser("User1");
        user2 = userService.createUser("User2");
    });
    
    it('initial there should be no themes', function () {
        var themes = themeService.getThemes();
        assert(Array.isArray(themes), 'themes should always retrun an array');
        assert.equal(themes.length, 0, 'there should be no themes in the list');
    });

    it('new theme should been added', function () {
        var themes = themeService.getThemes();
        assert.equal(themes.length, 0, 'there should be no themes in the list');
        var theme1 = themeService.addTheme("first theme", "a description", [], true, user1);
        assert.equal(themes.length, 1, 'there should be one theme in the list');
        assert(themes.includes(theme1), "themes should contain the 'first theme'");
        var theme2 = themeService.addTheme('second theme', "a description", [], true, user1);
        assert.equal(themes.length, 2, 'there should be two theme in the list');
        assert(themes.includes(theme2, theme1), "themes should contain the 'first theme' and 'second theme'");
        themeService.removeTheme(theme1._id);
        themeService.removeTheme(theme2._id);
    });

    it('remove themes', function () {
        var theme1 = themeService.addTheme("first theme");
        var theme2 = themeService.addTheme("second theme");
        var theme3 = themeService.addTheme("third theme");
        var themes = themeService.getThemes();
        assert.strictEqual(themes.length, 3, 'there should be three themes in the list');
        assert(themes.includes(theme1, theme2, theme3), "themes should contain the theme1, theme2 and theme3");
        themeService.removeTheme("second theme");
        assert.strictEqual(themes.length, 2, 'there should be two themes in the list');
        assert(themes.includes(theme2, theme3), "themes should contain the theme2 and theme3");
        themeService.removeTheme("first theme");
        assert.strictEqual(themes.length, 1, 'there should be one theme in the list');
        assert(themes.includes(theme3), "themes should contain the theme3");
        themeService.removeTheme("third theme");
        assert.strictEqual(themes.length, 0, 'there should be no themes in the list');
    });

    it('update theme', function () {
        var theme1 = themeService.addTheme("first theme", "a description", [], true, user1);
        assert.strictEqual(theme1.title, "first theme", 'the theme-title should been "first theme"');
        assert.strictEqual(theme1.description, "a description", 'the theme-description should been "a description"');
        assert.strictEqual(theme1.isPublic, true, 'the theme-isPublic should been "true"');
        assert(theme1.organisers.includes(user1), 'the theme-organisers should contain "user1"');

        themeService.changeTheme(theme1._id, "new Title", "new description", [], false, user2);
        assert.strictEqual(theme1.title, "new Title", 'the theme-title should been "new Title"');
        assert.strictEqual(theme1.description, "new description", 'the theme-description should been "new description"');
        assert.strictEqual(theme1.isPublic, false, 'the theme-isPublic should been "false"');
        assert(theme1.organisers.includes(user2), 'the theme-organisers should contain "user2"');
        
        themeService.removeTheme(theme1._id);
    });
    
    it('get a theme', function () {
        var theme1 = themeService.addTheme("first theme", "a description", [], true, user1);
        var testTheme = themeService.getTheme(theme1._id);
        assert.strictEqual(theme1, testTheme, "should get theme1");
        
        themeService.removeTheme(theme1._id)
    });

});