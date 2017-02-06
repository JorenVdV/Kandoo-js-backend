/**
 * Created by nick on 06/02/17.
 */
var assert = require('assert');

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let app = require('../app');
let should = chai.should();


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