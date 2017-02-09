var assert = require('assert');
var themeService = require('../services/theme-service');

describe("theme service tests", function(){
    // before(function () {
    //     var userService =  require('../services/user-service')
    //     var user1 = userService.addUser("User1");
    //     var user2 = userService.addUser("User2");
    // });
    it('initial there should be no themes', function () {
        var themes = themeService.getThemes();
        assert(Array.isArray(themes), 'themes should always retrun an array');
        assert.equal(themes.length, 0, 'there should be no themes in the list');
    });

    it('new theme should been added', function () {
        var themes = themeService.getThemes();
        assert.equal(themes.length, 0, 'there should be no themes in the list');
        var theme1 = themeService.addTheme("first theme", "a description", true);
        assert.equal(themes.length, 1, 'there should be one theme in the list');
        assert(themes.includes(theme1), "themes should contain the 'first theme'");
        var theme2 = themeService.addTheme('second theme');
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
        assert.equal(themes.length, 3, 'there should be three themes in the list');
        assert(themes.includes(theme1, theme2, theme3), "themes should contain the theme1, theme2 and theme3");
        themeService.removeTheme("second theme");
        assert.equal(themes.length, 2, 'there should be two themes in the list');
        assert(themes.includes(theme2, theme3), "themes should contain the theme2 and theme3");
        themeService.removeTheme("first theme");
        assert.equal(themes.length, 1, 'there should be one theme in the list');
        assert(themes.includes(theme3), "themes should contain the theme3");
        themeService.removeTheme("third theme");
        assert.equal(themes.length, 0, 'there should be no themes in the list');
    });

});