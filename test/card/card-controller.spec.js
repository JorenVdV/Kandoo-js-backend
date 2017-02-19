/**
 * Created by nick on 13/02/17.
 */
const config = require('../../_config');
const mongoose = require('mongoose');
process.env.NODE_ENV = 'test';

var chai = require('chai');
var chaiHttp = require('chai-http');
var assert = chai.assert;
var should = chai.should();
var server = require('../../app-test');

chai.use(chaiHttp);

describe('Card Controller tests', function () {
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

    describe('/POST /theme/{themeId}/card', function () {

        before(function () {


        });
        it('should create a new card and add it to the theme', function () {
            var userService = require('../../services/user-service');
            var themeService = require('../../services/theme-service');
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
            userService.removeUser(user1._id);

        });


    });

    after('Closing connection to test database', function(done){
        mongoose.disconnect();
        done();
    });
});