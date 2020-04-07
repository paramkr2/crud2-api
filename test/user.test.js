process.env.NODE_ENV = 'test'

var{ describe } = require('mocha')
const expect = require('chai').expect // assertion 
const request = require('supertest'); // this is going to make the api calls for us 
const mongoose = require('mongoose');
const app = require('../app.js');

// testing three user routes, /signup, /login, /user
describe('POST tests', function(){
    // now if we use arraw function it then , 'this' keyword will be of different scope 
    var globalObject = this;
    this.timeout(15000)

    before( function(done){
        this.db = mongoose.connect('mongodb://localhost/testdatabase', {useNewUrlParser: true , useUnifiedTopology: true })
        .then( res=>{
            //console.log( 'Mongoose connected');
            done();
        }).catch( err =>{
            //console.log( 'Error caught')
            done(err);
        })
        
    })

    after( function(done){
        mongoose.connection.db.dropDatabase( this.db, (err, result) =>{
            if( err ){ 
                return console.log('Error Dropping database') 
            }
            //console.log('Successfully Dropped Databse')
            
        });
        
        done();
    })

    it( 'OK,signup getting token' , function(done){
        request(app)
            .post('/signup')
            .send( {username:"param", password:"pass", confirmPassword:"pass", email:"djl@gmail.com"})
            .then( function(res){
                //console.log( 'signup' , res.body );
                const body = res.body;
                
                expect(body).to.contain.property("token")
                globalObject.token = res.body.token;
                done();
            }).catch( err =>{
                //console.log( 'error caught')
                done(err);
            });
    });
    it('OK, Get Login', (done) => {
        request(app)
            .post('/login')
            .send( {username:"param", password:"pass"})
            .then( function(res){
                //console.log( 'Logiing in ', res.body )
                expect(res.body).to.contain.property("token");
                done();
            }).catch( err =>{
                console.log('error caught')
                done(err);
            })

    })

    it( 'OK user', (done) => {
        var header = 'Bearer ' + globalObject.token ;
        request(app)
            .get('/user')
            .set( 'authorization', header )
            .then( function(res){
                //console.log( 'Get User', res.body );
                expect(res.body).to.contain.keys(['username','bio','email','age'])
                done();
            }).catch(err=>{
                done(err);
            })

    })
})