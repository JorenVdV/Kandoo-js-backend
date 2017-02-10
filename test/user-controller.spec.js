/**
 * Created by steve on 2/10/2017.
 */
var chai = require('chai');
var chaiHttp = require('chai-http');
var assert = chai.assert;
var should = chai.should();
var server = require('../app');

chai.use(chaiHttp);

describe('User Controller tests', function(){
   describe('/POST register', function (){
      it('should create a user', (done) => {
          let user = {
              firstname: 'Joren',
              lastname: 'Van de Vondel',
              organisation: 'Big Industries',
              password: 'Pudding',
              emailAddress: 'joren.vdv@kdg.be'
          };
          chai.request(server)
              .post('/register')
              .send(user)
              .end((err,res) => {
                    res.should.have.status(201);
                    done();
              });
      })
   });

   describe('/GET users', function(){
       it('should get a user', (done) => {
           let user = {
               firstname: 'Joren',
               lastname: 'Van de Vondel',
               organisation: 'Big Industries',
               password: 'Pudding',
               emailAddress: 'joren.vdv@kdg.be'
           };
           chai.request(server)
               .post('/register')
               .send(user)
               .end((err,res) => {
                   res.should.have.status(201);
                   done();
               });
           chai.request(server)
               .get('/users')
               .send()
               .end((err,res) => {
                  res.should.have.property('users');
                  assert.strictEquals(res.users.length, 1, 'there should be a single user');
               });
       });
   })
});