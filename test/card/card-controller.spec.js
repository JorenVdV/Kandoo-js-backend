/**
 * Created by nick on 13/02/17.
 */
process.env.NODE_ENV = 'test';

var chai = require('chai');
var chaiHttp = require('chai-http');
var assert = chai.assert;
var should = chai.should();
var server = require('../../app-test');
var userService = require('../../services/user-service');
var themeService = require('../../services/theme-service');


chai.use(chaiHttp);

describe('Card Controller tests', function () {

    describe('/POST /theme/{themeId}/card', function () {
        let CARDUser_user;
        before(function (done) {
            userService.createUser('Joren', 'Van de Vondel', 'joren.vdv@kdg.be', 'Big Industries', 'Pudding', function (user, err) {
                assert.isNotOk(err);
                assert.isOk(user);
                CARDUser_user = user;
                done();
            });
        });


        //TODO fix add a card
        console.error('########################');
        console.error('# TODO: fix add a card #');
        console.error('########################');
        // it('should create a new card and add it to the theme', function (done) {
        //     let theme = themeService.addTheme("first theme", "a description", [], true, CARDUser_user);
        //     let card = {description: 'This is a test description'};
        //
        //     chai.request(server)
        //         .post('/theme/' + theme._id + '/card')
        //         .send(card)
        //         .end((err, res) => {
        //             res.should.have.status(201);
        //             let theme1 = res.theme;
        //             assert.strictEqual(theme1.cards.length, 1, 'Length should be 1');
        //             done();
        //         });
        //     themeService.removeTheme(theme._id);
        // });

        after(function (done) {
            userService.findUserByEmail('joren.vdv@kdg.be', function (user, err) {
                assert.isNotOk(err);
                assert.isOk(user, 'user should have been found');

                userService.removeUser(user._id, function (succes, err) {
                    assert.isNotOk(err);
                    assert.isTrue(succes, 'user should have succesfully been deleted');
                    done();
                });
            });
        });
    });

});