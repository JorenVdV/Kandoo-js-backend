const config = require('../../_config');
const mongoose = require('mongoose');
process.env.NODE_ENV = 'test';

const chai = require('chai');
const assert = chai.assert;

var themeService = require('../../services/theme-service');
var cardService = require('../../services/card-service');
var userService = require('../../services/user-service');

describe("theme service tests", function () {
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

    let user1;
    let user2;
    beforeEach(function () {
        this.user1 = userService.createUser("User1", "Test", "user1.test@teamjs.xyz", "TeamJS", "pwd");
        this.user2 = userService.createUser("User2", "Test", "user2.test@teamjs.xyz", "TeamJS", "pwd");
    });
    
    it('Adding a new theme and check the content', function () {
        var theme = themeService.addTheme("first theme", "a description", [], true, user1);
        assert.strictEqual(theme.title, 'first theme', 'the title of the theme should be "first theme"');
        assert.strictEqual(theme.description, 'a description', 'the description of the theme should be "a description"');
        assert(Array.isArray(theme.tags), 'the tags of the theme should be an empty array');
        assert.strictEqual(theme.isPublic, true, 'the theme should be public');
        assert(theme.organisers.includes(user1), 'the theme should contain its creator');
        assert.strictEqual(theme.organisers.length,1, 'the theme should only contain one organiser at this moment');
        themeService.removeTheme(theme._id);

        theme = themeService.addTheme("what will we drink?", "beer or wine", [], false, user2);
        assert.strictEqual(theme.title, 'what will we drink?', 'the title of the theme should be "first theme"');
        assert.strictEqual(theme.description, 'beer or wine', 'the description of the theme should be "a description"');
        assert(Array.isArray(theme.tags), 'the tags of the theme should be an empty array');
        assert.strictEqual(theme.isPublic, false, 'the theme should be public');
        assert(theme.organisers.includes(user2), 'the theme should contain its creator');
        assert.strictEqual(theme.organisers.length,1, 'the theme should only contain one organiser at this moment');
        themeService.removeTheme(theme._id);
    });

    it('Removing themes', function () {
        var theme1 = themeService.addTheme("First theme", "a description", [], true, user1);
        var theme2 = themeService.addTheme("Second theme", "a description", [], true, user1);
        var theme3 = themeService.addTheme("Third theme", "a description", [], true, user1);
        
        themeService.removeTheme(theme2._id);
        assert.isNotOk(themeService.getTheme(theme2._id), "Second theme should have been removed");
        assert.strictEqual(themeService.getTheme(theme1._id), theme1,"First theme should still been safed");
        assert.strictEqual(themeService.getTheme(theme3._id), theme3,"Third theme should still been safed");

        themeService.removeTheme(theme1._id);
        assert.isNotOk(themeService.getTheme(theme1._id), "First theme should have been removed");
        assert.isNotOk(themeService.getTheme(theme2._id), "Second theme should have been removed");
        assert.strictEqual(themeService.getTheme(theme3._id), theme3,"Third theme should still been safed");
        
        themeService.removeTheme(theme3._id);
        assert.isNotOk(themeService.getTheme(theme1._id), "First theme should have been removed");
        assert.isNotOk(themeService.getTheme(theme2._id), "Second theme should have been removed");
        assert.isNotOk(themeService.getTheme(theme3._id), "Third theme should have been removed");
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

    it('adds a card to a theme', function () {
        var card = cardService.addCard('This is a description');

        var theme1 = themeService.addTheme("first theme", "a description", [], true, user1);
        theme1.populate('cards');

        themeService.addCard(theme1._id, card);

        assert.isArray(theme1.cards, 'Should be an array');
        assert.lengthOf(theme1.cards, 1, 'The amount of cards should be 1');
        assert.equal(theme1.cards[0], card._id, 'The id should be equal to the cards\' id');
    });

    afterEach(function(){
       userService.removeUser(this.user1._id);
       userService.removeUser(this.user2._id);
    })

    after('Closing connection to test database', function(done){
        mongoose.disconnect();
        done();
    });
});