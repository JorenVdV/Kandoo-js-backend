/**
 * Created by nick on 06/02/17.
 */
var assert = require('assert');

//Require the dev-dependencies
var chai = require('chai');
var chaiHttp = require('chai-http');
var app = require('../app');
var should = chai.should();


chai.use(chaiHttp);

describe('Session', () => {
    describe('/GET session', () => {
        it('it should return status 200', (done) => {
            chai.request(app)
                .get('/session')
                .end((err, res) => {
                    res.should.have.status(200);
                    done();
                });
        });
    });

});