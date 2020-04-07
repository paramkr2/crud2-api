const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors')
const mongoose = require('mongoose');

var routes = require('./routes/index');
var {MONGODB} = require('./config');

if( process.env.NODE_ENV !== 'test' ){
    mongoose.connect( MONGODB ,  {useNewUrlParser: true , useUnifiedTopology: true } )
    .then( (res,err) =>{
        if( err ) {
            console.log( 'Error Connecting databse ');
            
        }
        console.log('mongo response connected' )
        
    })
}




//Load env variable using dotenv
require('dotenv').config({path:'variables.env'});

var corsOptions = {
  credentials:true,
  origin:  'http://localhost:3000' , //'https://enigmatic-oasis-11563.herokuapp.com',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(cors(corsOptions));
app.use( bodyParser.json() );
app.use( bodyParser.urlencoded({extended:false}) )


app.use( '/' , routes );

app.use( function( req , res , next ){
    const err = new Error('Requested route not Defined');
    err.status = 404;
    next(err);
});

app.use ( function( err, req,res,next ){
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
})


module.exports = app ;


