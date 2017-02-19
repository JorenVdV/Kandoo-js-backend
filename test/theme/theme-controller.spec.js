/**
 * Created by Seger on 13/02/2017.
 */
const config = require('../../_config');
const mongoose = require('mongoose');
process.env.NODE_ENV = 'test';

var chai = require('chai');
var chaiHttp = require('chai-http');
var assert = chai.assert;
var should = chai.should();
var server = require('../../app-test');
const userService = require('../../services/user-service');

chai.use(chaiHttp);

describe('Theme controller tests', function () {
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
    before(function () {
        this.user1 = userService.createUser("User1", "Test", "user1.test@teamjs.xyz", "TeamJS", "pwd");
    });
    describe('/POST newTheme', function () {
        it('should create a theme', (done) => {
            let theme = {
                title: "New Theme",
                description: "",
                tags: [],
                isPublic: true,
                organiser: user1
            };
            chai.request(server)
                .post('/theme')
                .send(theme)
                .end((err,res) => {
                    res.should.have.status(201);
                    done();
                });
        });
    });

    describe('/GET themes', function () {
        it('should get themes', (done) => {
            let theme = {
                title: "New Theme",
                description: "",
                tags: [],
                isPublic: true,
                organiser: user1
            };
            chai.request(server)
                .post('/theme')
                .send(theme)
                .end((err,res) => {
                    res.should.have.status(201);
                    
                });
            chai.request(server)
                .get('/themes')
                .send()
                .end((err,res) => {
                    res.should.have.status(200);
                    res.body.should.have.property('themes');
                    // assert.strictEqual(res.body.themes.length, 1, 'there should be a single theme');
                    done();
                });
        });
    });

    describe('/GET theme', function () {
        let theme;
        before(function () {
            let themeService = require('../../services/theme-service');
            theme = themeService.addTheme("New Theme", "", [], true, user1);
        });
        it('should get a theme', (done) => {
            chai.request(server)
                .get('/theme/' + theme._id)
                .send()
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.property('theme');
                    assert.strictEqual(res.body.theme.title, theme.title, 'the theme title should be "New Theme"');
                    assert.strictEqual(res.body.theme.description, theme.description, 'the theme description should be ""');
                    assert(Array.isArray(res.body.theme.tags), 'the theme tags should be an array');
                    assert(res.body.theme.isPublic, 'the theme should be public');
                    // assert(res.body.theme.organisers.includes(user1), 'user1 should be an organiser of the theme');
                    done();
                });
        });
        after(function () {
            let themeService = require('../../services/theme-service');
            themeService.removeTheme(theme._id);
        });
    });

    describe('/DELETE theme', function () {
        let theme;
        before(function () {
            let themeService = require('../../services/theme-service');
            theme = themeService.addTheme("New Theme", "", [], true, user1);
        });
        it('should delete a theme', (done) => {
            chai.request(server)
                .delete('/theme/' + theme._id)
                .send()
                .end((err,res) => {
                    res.should.have.status(204);
                });

            chai.request(server)
                .get('/theme/' + theme._id)
                .send()
                .end((err,res) => {
                    res.should.have.status(404);
                    done();
                });
            
        });
    });
    after(function(){
        userService.removeUser(this.user1._id);
    });

    after('Closing connection to test database', function(done){
        mongoose.disconnect();
        done();
    });
});