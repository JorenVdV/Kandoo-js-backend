/**
 * Created by Seger on 13/02/2017.
 */
process.env.NODE_ENV = 'test';

var chai = require('chai');
var chaiHttp = require('chai-http');
var assert = chai.assert;
var should = chai.should();
var server = require('../../app-test');
const userService = require('../../services/user-service');
const themeService = require('../../services/theme-service');

chai.use(chaiHttp);

describe('Theme controller tests', function () {

    let THEME_globalTestUser;
    before('create testUser', function (done) {
        userService.createUser("User1", "Test", "user1.test@teamjs.xyz", "TeamJS", "pwd", function (user, err) {
            assert.isNotOk(err);
            assert.isOk(user);
            THEME_globalTestUser = user;
            done();
        });
    });

    describe('/POST newTheme', function () {
        it('should create a theme', (done) => {
            let theme = {
                title: "New Theme",
                description: "",
                tags: [],
                isPublic: true,
                organiser: THEME_globalTestUser
            };
            chai.request(server)
                .post('/theme')
                .send(theme)
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.have.property('theme');
                    let resultTheme = res.body.theme;
                    assert.strictEqual(resultTheme.title, theme.title);
                    assert.strictEqual(resultTheme.description, theme.description);
                    assert.strictEqual(resultTheme.tags.length, theme.tags.length);
                    assert.strictEqual(resultTheme.organisers.length, 1);
                    assert.equal(resultTheme.organisers[0].toString(), THEME_globalTestUser._id.toString());

                    themeService.removeTheme(resultTheme._id, function (success, err) {
                        assert.isNotOk(err);
                        assert.isTrue(success);
                        done();
                    });
                });
        });
    });

    describe('/GET theme', function () {
        let GET_THEME_theme;
        before('Create a theme', function (done) {
            themeService.addTheme('first theme', 'a description', [], true, THEME_globalTestUser, null, function (theme, err) {
                assert.isNotOk(err);
                assert.isOk(theme);
                GET_THEME_theme = theme;
                done();
            });
        });

        it('retrieve the theme', (done) => {
            chai.request(server)
                .get('/theme/' + GET_THEME_theme._id)
                .send()
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.property('theme');
                    let resultTheme = res.body.theme;
                    assert.strictEqual(resultTheme.title, GET_THEME_theme.title);
                    assert.strictEqual(resultTheme.description, GET_THEME_theme.description);
                    assert.strictEqual(resultTheme.tags.length, GET_THEME_theme.tags.length);
                    assert.strictEqual(resultTheme.isPublic, GET_THEME_theme.isPublic);
                    assert.strictEqual(resultTheme.organisers.length, 1);
                    assert.strictEqual(resultTheme.organisers[0].toString(), THEME_globalTestUser._id.toString());
                    done();
                });
        });

        it('retrieve non-existent theme', (done) => {
            chai.request(server)
                .get('/theme/' + '00aa0aa000a000000a0000aa')
                .send()
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.should.have.property('error');
                    assert.isOk(res.body.error);
                    assert.strictEqual(res.body.error, "Unable to find theme with id: " + '00aa0aa000a000000a0000aa');
                    done();
                });
        });

        after('Remove the created theme', function(done){
            themeService.removeTheme(GET_THEME_theme._id, function (success, err) {
                assert.isNotOk(err);
                assert.isTrue(success);
                done();
            });
        });
    });

    describe('/GET themes', function(){

        describe('Retrieving all themes - no themes', function(){
            it('Retrieve no themes', function(done){
                chai.request(server)
                    .get('/themes')
                    .send()
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.have.property('themes');
                        let resultThemes = res.body.themes;
                        assert.strictEqual(resultThemes.length, 0);

                        done();
                    });
            });
        });

        describe('Retrieving all themes - a single theme', function(){
            let GET_THEMES_theme1;
            before('Create a first theme', function (done) {
                themeService.addTheme('first theme', 'a description', [], true, THEME_globalTestUser, null, function (theme, err) {
                    assert.isNotOk(err);
                    assert.isOk(theme);
                    GET_THEMES_theme1 = theme;
                    done();
                });
            });

            it('Retrieve a single theme', function(done){
                chai.request(server)
                    .get('/themes')
                    .send()
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.have.property('themes');
                        let resultThemes = res.body.themes;
                        assert.strictEqual(resultThemes.length, 1);
                        let resultTheme = resultThemes[0];
                        assert.strictEqual(resultTheme.title, GET_THEMES_theme1.title);
                        assert.strictEqual(resultTheme.description, GET_THEMES_theme1.description);
                        assert.strictEqual(resultTheme.tags.length, GET_THEMES_theme1.tags.length);
                        assert.strictEqual(resultTheme.isPublic, GET_THEMES_theme1.isPublic);
                        assert.strictEqual(resultTheme.organisers.length, 1);
                        assert.strictEqual(resultTheme.organisers[0].toString(), THEME_globalTestUser._id.toString());

                        done();
                    });
            });

            after('Remove the created theme', function(done){
                themeService.removeTheme(GET_THEMES_theme1._id, function (success, err) {
                    assert.isNotOk(err);
                    assert.isTrue(success);
                    done();
                });
            });
        });

        describe('Retrieving all themes - two themes', function(){
            let GET_THEMES_theme1;
            let GET_THEMES_theme2;
            before('Create a first theme', function (done) {
                themeService.addTheme('first theme', 'a description', [], true, THEME_globalTestUser, null, function (theme, err) {
                    assert.isNotOk(err);
                    assert.isOk(theme);
                    GET_THEMES_theme1 = theme;
                    done();
                });
            });

            before('Create a second theme', function (done) {
                themeService.addTheme('first theme', 'a description', [], true, THEME_globalTestUser, null, function (theme, err) {
                    assert.isNotOk(err);
                    assert.isOk(theme);
                    GET_THEMES_theme2 = theme;
                    done();
                });
            });

            it('Retrieve two themes', function(done){
                chai.request(server)
                    .get('/themes')
                    .send()
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.have.property('themes');
                        let resultThemes = res.body.themes;
                        assert.strictEqual(resultThemes.length, 2);
                        let resultTheme1 = resultThemes[0];
                        assert.strictEqual(resultTheme1.title, GET_THEMES_theme1.title);
                        assert.strictEqual(resultTheme1.description, GET_THEMES_theme1.description);
                        assert.strictEqual(resultTheme1.tags.length, GET_THEMES_theme1.tags.length);
                        assert.strictEqual(resultTheme1.isPublic, GET_THEMES_theme1.isPublic);
                        assert.strictEqual(resultTheme1.organisers.length, 1);
                        assert.strictEqual(resultTheme1.organisers[0].toString(), THEME_globalTestUser._id.toString());

                        let resultTheme2 = resultThemes[1];
                        assert.strictEqual(resultTheme2.title, GET_THEMES_theme2.title);
                        assert.strictEqual(resultTheme2.description, GET_THEMES_theme2.description);
                        assert.strictEqual(resultTheme2.tags.length, GET_THEMES_theme2.tags.length);
                        assert.strictEqual(resultTheme2.isPublic, GET_THEMES_theme2.isPublic);
                        assert.strictEqual(resultTheme2.organisers.length, 1);
                        assert.strictEqual(resultTheme2.organisers[0].toString(), THEME_globalTestUser._id.toString());

                        done();
                    });
            });

            after('Remove the first theme', function(done){
                themeService.removeTheme(GET_THEMES_theme1._id, function (success, err) {
                    assert.isNotOk(err);
                    assert.isTrue(success);
                    done();
                });
            });

            after('Remove the second theme', function(done){
                themeService.removeTheme(GET_THEMES_theme2._id, function (success, err) {
                    assert.isNotOk(err);
                    assert.isTrue(success);
                    done();
                });
            });
        });

    });

    // describe('/GET theme', function () {
    //     let theme;
    //     before(function () {
    //         let themeService = require('../../services/theme-service');
    //         theme = themeService.addTheme("New Theme", "", [], true, user1);
    //     });
    //     it('should get a theme', (done) => {
    //         chai.request(server)
    //             .get('/theme/' + theme._id)
    //             .send()
    //             .end((err, res) => {
    //                 res.should.have.status(200);
    //                 res.body.should.have.property('theme');
    //                 assert.strictEqual(res.body.theme.title, theme.title, 'the theme title should be "New Theme"');
    //                 assert.strictEqual(res.body.theme.description, theme.description, 'the theme description should be ""');
    //                 assert(Array.isArray(res.body.theme.tags), 'the theme tags should be an array');
    //                 assert(res.body.theme.isPublic, 'the theme should be public');
    //                 // assert(res.body.theme.organisers.includes(user1), 'user1 should be an organiser of the theme');
    //                 done();
    //             });
    //     });
    //     after(function () {
    //         let themeService = require('../../services/theme-service');
    //         themeService.removeTheme(theme._id);
    //     });
    // });
    //
    // describe('/DELETE theme', function () {
    //     let theme;
    //     before(function () {
    //         let themeService = require('../../services/theme-service');
    //         theme = themeService.addTheme("New Theme", "", [], true, user1);
    //     });
    //     it('should delete a theme', (done) => {
    //         chai.request(server)
    //             .delete('/theme/' + theme._id)
    //             .send()
    //             .end((err,res) => {
    //                 res.should.have.status(204);
    //             });
    //
    //         chai.request(server)
    //             .get('/theme/' + theme._id)
    //             .send()
    //             .end((err,res) => {
    //                 res.should.have.status(404);
    //                 done();
    //             });
    //
    //     });
    // });

    after('Remove testUser', function (done) {
        userService.removeUser(THEME_globalTestUser._id, function (succes, err) {
            assert.isNotOk(err);
            assert.isTrue(succes, 'user should have succesfully been deleted');
            done();
        })
    });

});