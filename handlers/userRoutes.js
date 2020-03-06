
var UserItem = require('../models/UserItem');
var UserDocument = require('../models/UserDocument');
var {isEmail , isAuthenticated } = require('../util/userfulFunctions')
const jwt = require('jsonwebtoken')




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
    console.log(req.body);
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

function create(req,res){
    console.log(req.body);
    
    let {username,  title , content } = req.body;

    UserDocument.find( {username:username} , (err,data) =>{
        if( err ){
            console.log(err);
        }else{
            if( data.length > 0 ){
                
                
                data[0].updateOne( update = { $push: { documents:{title:title,content:content} } } , (err,savedItem)=>{

                    if( err ){
                        return res.status(400).send({error:err})
                    }else{
                        return res.send({message:'Inserted'})
                    }
                })
            }else{
                let UserDoc = new UserDocument();
                UserDoc.username = username;
                UserDoc.documents.push( {title:title,content:content})
                UserDoc.save( (err,savedItem)=>{

                    if( err ){
                        return res.status(400).send({error:err})
                    }else{
                        return res.send({message:'Inserted'})
                    }
                })
            }
        }
    })
    
}

 function list(req,res){
    console.log('in /list')
    const {username} = req.body ;

    UserDocument.find( {username:username} , (err, data ) => {
         if(err){
             return res.status(400).send( {error:'error finding documents for user'} )
         }else if( data.length == 0 ){
            return res.status(400).send( {error:`No entry found for ${username}`})   
         }else{
            return  res.send( data[0] );
         }
    })
}

function editDocument(req,res){
   console.log('in /editDocument');
   const {username, _id , title, content } = req.body;
   let error = {} ;
   UserDocument.find( { username: username } , (err,data) =>{
        if( err ){
            res.status(400).send( { error: `error occured ${err}` });
        }else if( data.length > 0 ){
            let item = data[0];
            UserDocument.updateOne( { 'documents._id' : _id},{$set : { "documents.$.title":title,"documents.$.content":content  } }, (err,data ) => {
                if( err ){
                    console.log( err );
                    error.update = "error inserting";
                    return res.status(400).send(  error  );
                }
                else{
                    return res.status(200).send( {message:"inserted" } );
                }
            })
           // res.status(200).send( {data : data })
        }else{
            error.update = 'No data present for username'
            res.status(400).send( { data: `No Data ${data}`})
        }
   });
    
}

function removeDocument( req, res){
    console.log('in /removeDocument');
    const {username, _id , title, content } = req.body;
    let error = {}
    UserDocument.updateOne( { 'username' : username },{$pull : { 'documents' : { '_id' : _id}  } }, (err,data ) => {
        if( err ){
            console.log( err );
            error.update = "error inserting";
            return res.status(400).send(  error  );
        }
        else{
            console.log( data );
            return res.status(200).send( {message:"removed" } );
        }
    })
}


module.exports = { create, list, login, signup , user, updateuser , editDocument ,removeDocument}
