/**
 * Created by Seger on 13/02/2017.
 */
var chai = require('chai');
var chaiHttp = require('chai-http');
var assert = chai.assert;
var should = chai.should();
var server = require('../app');

chai.use(chaiHttp);

describe('Theme controller tests', function () {
    let user1;
    before(function () {
        var userService =  require('../services/user-service');
        user1 = userService.createUser("User1");
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

    describe('/Get themes', function () {
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
                    done();
                });
            chai.request(server)
                .get('/themes')
                .send()
                .end((err,res) => {
                    res.should.have.status(200);
                    res.should.have.property('themes');
                    assert.strictEquals(res.themes.length, 1, 'there should be a single theme');
                });
        });
    });

    // describe('/DELETE theme', function () {
    //     it('should delete a theme', (done) => {
    //         let theme = {
    //             title: "New Theme",
    //             description: "",
    //             tags: [],
    //             isPublic: true,
    //             organiser: user1
    //         };
    //
    //         chai.request(server)
    //             .post('/theme')
    //             .send(theme)
    //             .end((err,res) => {
    //                 res.should.have.status(201);
    //                 let themeId = res.body.id;
    //                 console.log(res)
    //                 chai.request(server)
    //                     .delete('/theme/'+themeId)
    //                     .end((err,res) => {
    //                         res.should.have.status(201);
    //                         done();
    //                     });
    //                 done();
    //             });
    //     });
    // });
});