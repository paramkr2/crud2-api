var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var {isEmail , isAuthenticated } = require('./util/userfulFunctions')

const { login,
        signup, 
        list, 
        create , 
        user , 
        updateuser , 
        editDocument , 
        removeDocument , 
    } = require( './handlers/userRoutes');

// mongoose stuff

const mongoose = require('mongoose');
//db = mongoose.connect('mongodb://localhost/crud2-api' , { useNewUrlParser: true , useUnifiedTopology: true });

db = mongoose.connect('mongodb+srv://aman:amanpass@cluster0-mdkwp.mongodb.net/test?retryWrites=true&w=majority' ,  {useNewUrlParser: true , useUnifiedTopology: true } )
.then( res =>{
    console.log('mongo response connected' )
}).catch( err =>{
    console.log('mongo error', err);
})


//cors stuff 
var cors = require('cors')
var corsOptions = {
  credentials:true,
  origin: 'https://enigmatic-oasis-11563.herokuapp.com',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(cors(corsOptions));

// middleware stuff 
app.use( bodyParser.json() );
app.use( bodyParser.urlencoded({extended:false}) )


// user manipulation endpoints
app.get('/user', user)
app.post('/signup', signup)
app.post('/updateuser', updateuser);
app.post('/login' , login )

// document manipulation endpoints
app.post('/create', create );
app.post('/list', list )
app.post('/editDocument', editDocument );
app.post('/removeDocument', removeDocument );


app.listen( process.env.PORT || 2000, function(res){
    console.log('Server running on port 2000');
})


