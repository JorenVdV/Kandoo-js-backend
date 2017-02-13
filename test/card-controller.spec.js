/**
 * Created by nick on 13/02/17.
 */

var chai = require('chai');
var chaiHttp = require('chai-http');
var assert = chai.assert;
var should = chai.should();
var server = require('../app');

chai.use(chaiHttp);

describe('Card Controller tests', function () {
    describe('/POST /theme/{themeId}/card', function () {

        before(function () {


        });
        it('should create a new card and add it to the theme', function () {
            var userService = require('../services/user-service');
            var themeService = require('../services/theme-service');
            let user1 = userService.createUser("User1");
            let theme = themeService.addTheme("first theme", "a description", [], true, user1);

            let card = {description: 'This is a test description'};

            // console.log('/theme/' + theme._id + '/card');
            chai.request(server)
                .post('/theme/' + theme._id + '/card')
                .send(card)
                .end((err, res) => {
                    res.should.have.status(201);
                    let theme1 = res.theme;
                    assert.strictEqual(theme1.cards.length, 1, 'Length should be 1');
                    done();

                });


            themeService.removeTheme(theme._id);

        });


    });
});