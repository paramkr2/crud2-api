
var UserItem = require('../models/UserItem');
var UserDocument = require('../models/UserDocument');
var {isEmail , isAuthenticated } = require('../util/userfulFunctions')
const jwt = require('jsonwebtoken')


function testRoute( req,res ){
    console.log( 'in /testRoute')
    res.status(200).send({data:'successfull send data'});
}

function user(req,res){
    console.log('in /user ');
    let token = req.headers.authorization.split(' ')[1];
    jwt.verify( token , 'mySecretKey' , {algorithm:'HS256'} , function(err,user){
        if( err ){
            return res.status(400).send({error:'invalid token'})
        }else{
            UserItem.find( { username:user.username } , function(err,data){
                if(err){
                    return res.status(400).send({error:user.username + 'not found'})
                }else{
                    return res.status(200).send( data[0] );
                }
            })
        }
    } )

    return 
}

function signup (req,res){
    const {email,password,confirmPassword,username} = req.body;
    //console.log(req.body);
    // standard verfication 
    let error = {}
    if( email === '' ){
        error.email = 'email field empty'
    }else if( !isEmail(email) ){
        error.email = 'invalid email'  
    }
    if( password === '' ){
        error.password = 'password field empty'
    }
    if( confirmPassword === ''){
        error.confirmPassword = 'confirm Password field empty'
    }
    else if( password !== confirmPassword ){
        error.errors = 'password mismatch'
    }
    if( username === '' ){
        error.username = 'username field empty'
    }
   
    if( Object.keys(error).length > 0 ){
        return res.status(400).send(error);
    }

    
    var user = new UserItem();
    user.email = email; user.password = password; user.username = username;

    // check if username and email already exists , and if not , then save it into the database and return jwt token 
    // Have to find a better wat than this nested promises
    UserItem.find( {username:username} , (err ,data ) => {
        if( err ){
            console.log(err);
            return err 
        }
        return data ;

    })
    .then( data =>{
        if( data.length > 0 ){
            alreadyExists = true;
            return res.status(400).send({errors:'username already exists'})
        }else{
            UserItem.find( {email:email} , (err ,data ) => {
                return data 
            })
            .then( data =>{
                if( data.length > 0 ) {
                    return res.status(400).send( { errors:'email already exists'})
                }else{
                    user.save( function( err , savedItem){ 
                        if( err ){
                            return res.status(400).send( {errors:err});
                        }
                        
                        let token = jwt.sign( {username:username} ,'mySecretKey', {algorithm:'HS256'}  )
                        return res.status(200).send( {token:token} )
                    })
                }
            })
        }
    })
    .catch( err => {
        console.log('This is working ' , err);
        return res.status(500).send({error:'Internal database error'})
    })

}


function login(req,res){
    const{ username, password } = req.body;
    if( username === ''){
        return res.status(400).send({error:'username field empty'})
    }else if( password===''){
        return res.status(400).send({error: ' password field empty'})
    }

    UserItem.find( {username:username,password:password} , (err,data) => {
        if( err ){
            return res.status(400).send({error:'server error'})
        }else if( data.length === 0 ){
            return res.status(400).send({error:'username or password wrong'})
        }else if( data.length > 0 ){
            let token = jwt.sign( {username:username} ,'mySecretKey', {algorithm:'HS256'}  )
            return res.status(200).send( {token:token} )
        }
    }).catch( err =>{
        return res.send( {error:'error finding'})
    })

    // checking the database stuff 
}


function updateuser( req,res){
    console.log('in /updateUser')
    console.log(req.body);
    const {email, username} = req.body;
    if( email == '' ){
        res.status(400).send({error:'email field empty!'});
    }else if( username == ' '){
        res.status(400).send({error:'username field cannot be empty!'})
    }else if( !isEmail(email) ){
        res.status(400).send({error:'invalid email'})
    }

    UserItem.updateOne( {username:username}, update = req.body,
        (err,data) =>{
            if( err ){
                return res.status(400).send({error:'Error Updating'})
            }else if( data.nModified == 1 ){
                
                return res.send( {data:'Updated Successfully'})
            }else{
                return res.send( data );
            }
        }
    )
}


// Document manipulation paths 




module.exports = {  testRoute , login, signup , user, updateuser }
