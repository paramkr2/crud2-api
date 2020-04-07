var UserDocument = require('../models/UserDocument');


function create(req,res){
    //console.log(req.body);
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
    console.log(req.body);
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

module.exports = {create, list, removeDocument, editDocument };