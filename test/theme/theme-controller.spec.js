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
    let user_token;
    before('create testUser', async function () {
        THEME_globalTestUser = await userService.addUser("User1", "Test", "user1.test@teamjs.xyz", "TeamJS", "pwd");
        assert.isOk(THEME_globalTestUser);
    });

    before('Login user', function (done) {
        chai.request(server)
            .post('/login')
            .send({emailAddress: 'user1.test@teamjs.xyz', password: "pwd"})
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.have.property('token');
                res.body.should.have.property('userId');
                assert.strictEqual(res.body.userId.toString(), THEME_globalTestUser._id.toString());
                user_token = res.body.token;
                done();
            })
    });

    describe('/POST newTheme', function () {
        let createdTheme;
        it('should create a theme', function (done) {
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

                    createdTheme = resultTheme;
                    done();
                });
        });

        after('Remove the theme', async() => {
            let successful = await themeService.removeTheme(createdTheme._id);
            assert.isTrue(successful);
        })
    });

    describe('/GET theme', function () {
        let GET_THEME_theme;
        before('Create a theme', async function () {
            GET_THEME_theme = await themeService.addTheme('first theme', 'a description', [], true, THEME_globalTestUser, null);
            assert.isOk(GET_THEME_theme);
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
                    assert.strictEqual(resultTheme.organisers[0]._id.toString(), THEME_globalTestUser._id.toString());
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

        after('Remove the created theme', async function () {
            let successful = await themeService.removeTheme(GET_THEME_theme._id);
            assert.isTrue(successful);
        });
    });

    describe('/GET themes', function () {

        describe('Retrieving all themes - no themes', function () {
            it('Retrieve no themes', function (done) {
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

        describe('Retrieving all themes - a single theme', function () {
            let GET_THEMES_theme1;
            before('Create a first theme', async function () {
                GET_THEMES_theme1 = await themeService.addTheme('first theme', 'a description', [], true, THEME_globalTestUser, null);
                assert.isOk(GET_THEMES_theme1);
            });

            it('Retrieve a single theme', function (done) {
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
                        assert.strictEqual(resultTheme.organisers[0]._id.toString(), THEME_globalTestUser._id.toString());

                        done();
                    });
            });

            after('Remove the created theme', async function () {
                let successful = await themeService.removeTheme(GET_THEMES_theme1._id);
                assert.isTrue(successful);
            });
        });

        describe('Retrieving all themes - two themes', function () {
            let GET_THEMES_theme1;
            let GET_THEMES_theme2;
            let user2;
            let user2_token;

            before('Create themes and a second user', async function () {
                GET_THEMES_theme1 = await themeService.addTheme('first theme', 'a description', [], true, THEME_globalTestUser, null);
                assert.isOk(GET_THEMES_theme1);

                user2 = await userService.addUser('test', 'blem', 'test@blem.com', 'TeamJS', 'test');
                assert.isOk(user2);

                GET_THEMES_theme2 = await themeService.addTheme('second theme', 'a description', [], true, user2, null);
                assert.isOk(GET_THEMES_theme2);
            });

            before('Login user2', function (done) {
                chai.request(server)
                    .post('/login')
                    .send({emailAddress: 'test@blem.com', password: "test"})
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.have.property('token');
                        res.body.should.have.property('userId');
                        assert.strictEqual(res.body.userId.toString(), user2._id.toString());
                        user2_token = res.body.token;
                        done();
                    })
            });

            it('Retrieve two themes', function (done) {
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
                        assert.strictEqual(resultTheme1.organisers[0]._id.toString(), THEME_globalTestUser._id.toString());

                        let resultTheme2 = resultThemes[1];
                        assert.strictEqual(resultTheme2.title, GET_THEMES_theme2.title);
                        assert.strictEqual(resultTheme2.description, GET_THEMES_theme2.description);
                        assert.strictEqual(resultTheme2.tags.length, GET_THEMES_theme2.tags.length);
                        assert.strictEqual(resultTheme2.isPublic, GET_THEMES_theme2.isPublic);
                        assert.strictEqual(resultTheme2.organisers.length, 1);
                        assert.strictEqual(resultTheme2.organisers[0]._id.toString(), user2._id.toString());

                        done();
                    });
            });

            it('Retrieve themes from THEME_globalTestUser', function (done) {
                chai.request(server)
                    .get('/user/' + THEME_globalTestUser._id + '/themes')
                    .set('X-Access-Token', user_token)
                    .send()
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.have.property('themes');
                        let resultThemes = res.body.themes;
                        assert.strictEqual(resultThemes.length, 1);
                        let resultTheme1 = resultThemes[0];
                        assert.strictEqual(resultTheme1.title, GET_THEMES_theme1.title);
                        assert.strictEqual(resultTheme1.description, GET_THEMES_theme1.description);
                        assert.strictEqual(resultTheme1.tags.length, GET_THEMES_theme1.tags.length);
                        assert.strictEqual(resultTheme1.isPublic, GET_THEMES_theme1.isPublic);
                        assert.strictEqual(resultTheme1.organisers.length, 1);
                        assert.strictEqual(resultTheme1.organisers[0]._id.toString(), THEME_globalTestUser._id.toString());
                        done();
                    });
            });

            it('Retrieve themes from user2', function (done) {
                chai.request(server)
                    .get('/user/' + user2._id + '/themes')
                    .set('X-Access-Token', user2_token)
                    .send()
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.have.property('themes');
                        let resultThemes = res.body.themes;
                        assert.strictEqual(resultThemes.length, 1);
                        let resultTheme1 = resultThemes[0];
                        assert.strictEqual(resultTheme1.title, GET_THEMES_theme2.title);
                        assert.strictEqual(resultTheme1.description, GET_THEMES_theme2.description);
                        assert.strictEqual(resultTheme1.tags.length, GET_THEMES_theme2.tags.length);
                        assert.strictEqual(resultTheme1.isPublic, GET_THEMES_theme2.isPublic);
                        assert.strictEqual(resultTheme1.organisers.length, 1);
                        assert.strictEqual(resultTheme1.organisers[0]._id.toString(), user2._id.toString());
                        done();
                    });
            });

            after('Remove the themes and user', async function () {
                let successful = await themeService.removeTheme(GET_THEMES_theme1._id);
                assert.isTrue(successful);

                successful = await themeService.removeTheme(GET_THEMES_theme2._id);
                assert.isTrue(successful);

                successful = await userService.removeUser(user2._id);
                assert.isTrue(successful);
            });
        });

    });

    describe('/GET theme', function () {
        let theme;
        before(async function () {
            theme = await themeService.addTheme('first theme', 'a description', [], true, THEME_globalTestUser, null);
            assert.isOk(theme);
        });
        it('get a theme - existing id', (done) => {
            chai.request(server)
                .get('/theme/' + theme._id)
                .send()
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.property('theme');
                    assert.strictEqual(res.body.theme.title, theme.title);
                    assert.strictEqual(res.body.theme.description, theme.description);
                    assert.strictEqual(res.body.theme.tags.length, theme.tags.length);
                    assert.strictEqual(res.body.theme.isPublic, theme.isPublic);
                    assert.strictEqual(res.body.theme.organisers.length, 1);
                    assert.strictEqual(res.body.theme.organisers[0]._id.toString(), THEME_globalTestUser._id.toString());
                    done();
                });
        });

        it('get a theme - non existing id', (done) => {
            chai.request(server)
                .get('/theme/' + '00aa0aa000a000000a0000aa')
                .send()
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.should.have.property('error');
                    assert.strictEqual(res.body.error, 'Unable to find theme with id: ' + '00aa0aa000a000000a0000aa');
                    done();
                });
        });

        after(async function () {
            let successful = await themeService.removeTheme(theme._id);
            assert.isTrue(successful);
        });
    });

    describe('/DELETE theme', function () {
        let theme;
        before(async function () {
            theme = await themeService.addTheme('first theme', 'a description', [], true, THEME_globalTestUser, null);
            assert.isOk(theme);
        });
        it('delete a theme - existing id', (done) => {
            chai.request(server)
                .delete('/theme/' + theme._id + '/delete')
                .set('X-Access-Token', user_token)
                .send()
                .end((err, res) => {
                    res.should.have.status(204);
                    done();
                });
        });

        it('delete a theme - non existing id', (done) => {
            chai.request(server)
                .delete('/theme/' + '00aa0aa000a000000a0000aa' + '/delete')
                .set('X-Access-Token', user_token)
                .send()
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.should.have.property('error');
                    assert.strictEqual(res.body.error, 'Unable to find theme with id: ' + '00aa0aa000a000000a0000aa');
                    done();
                });
        });
    });

    describe('/PUT theme', function () {
        describe('Add and remove organisers', function () {
            let theme;
            let anotherUser;
            before(async function () {
                theme = await themeService.addTheme('first theme', 'a description', [], true, THEME_globalTestUser, null);
                assert.isOk(theme);
                anotherUser = await userService.addUser("User123", "Test456", "user123.test456@teamjs.xyz", "TeamJS", "pwd");
            });

            it('Add an organiser', function (done) {
                chai.request(server)
                    .put('/theme/' + theme._id + '/addorganiser')
                    .set('X-Access-Token', user_token)
                    .send({organiserEmail: anotherUser.emailAddress})
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.have.property('theme');
                        let updatedTheme = res.body.theme;
                        assert.strictEqual(updatedTheme.organisers.length, 2);

                        let organisers = updatedTheme.organisers.map(org => org._id.toString());
                        assert.isTrue(organisers.includes(anotherUser._id.toString()));
                        assert.strictEqual(updatedTheme.organisers.find(org => org._id == anotherUser._id).emailAddress, anotherUser.emailAddress);
                        done();
                    });
            });

            it('Remove an organiser', function (done) {
                chai.request(server)
                    .put('/theme/' + theme._id + '/removeorganiser')
                    .set('X-Access-Token', user_token)
                    .send({organiserId: THEME_globalTestUser._id})
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.have.property('theme');
                        let updatedTheme = res.body.theme;
                        assert.strictEqual(updatedTheme.organisers.length, 1);
                        let organisers = updatedTheme.organisers.map(org => org._id.toString());
                        assert.isTrue(organisers.includes(anotherUser._id.toString()));
                        assert.isFalse(organisers.includes(THEME_globalTestUser._id.toString()));
                        done();
                    });
            });


            after(async function () {
                let successful = await themeService.removeTheme(theme._id);
                assert.isTrue(successful);
                successful = await userService.removeUser(anotherUser._id);
                assert.isTrue(successful);
            });
        });

        describe('Update a theme', function () {
            let theme;
            before(async function () {
                theme = await themeService.addTheme('first theme', 'a description', ['a tag'], true, THEME_globalTestUser, null);
                assert.isOk(theme);
            });

            it('Update title and description', function (done) {
                let updates = {title: 'A fuzzy title', description: 'a weird description'};
                chai.request(server)
                    .put('/theme/' + theme._id + '/update')
                    .set('X-Access-Token', user_token)
                    .send(updates)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.have.property('theme');
                        let updatedTheme = res.body.theme;
                        assert.strictEqual(updatedTheme.title, updates.title);
                        assert.strictEqual(updatedTheme.description, updates.description);
                        assert.strictEqual(updatedTheme.tags.length, 1);
                        assert.strictEqual(updatedTheme.tags[0], 'a tag');
                        done();
                    });
            });

            it('Update tags', function (done) {
                let tags = theme.tags;
                tags.push('another tag', 'a third tag');
                let updates = {tags: tags};
                chai.request(server)
                    .put('/theme/' + theme._id + '/update')
                    .set('X-Access-Token', user_token)
                    .send(updates)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.have.property('theme');
                        let updatedTheme = res.body.theme;
                        assert.strictEqual(updatedTheme.title, theme.title);
                        assert.strictEqual(updatedTheme.description, theme.description);
                        assert.strictEqual(updatedTheme.tags.length, 3);
                        assert.strictEqual(updatedTheme.tags[0], 'a tag');
                        assert.strictEqual(updatedTheme.tags[1], 'another tag');
                        assert.strictEqual(updatedTheme.tags[2], 'a third tag');
                        done();
                    });
            });

            afterEach(async() => {
                theme = await themeService.getTheme(theme._id);
            });

            after(async function () {
                let successful = await themeService.removeTheme(theme._id);
                assert.isTrue(successful);
            });
        })
    });

    after('Remove testUser', async function () {
        let successful = await userService.removeUser(THEME_globalTestUser._id);
        assert.isTrue(successful);
    });

})
;