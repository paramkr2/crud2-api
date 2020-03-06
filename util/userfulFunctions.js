const jwt = require('jsonwebtoken');
const fs = require('fs');
const private = '../private.pem'
function isEmail ( email ){
    var emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailPattern.test(email)
}

// next is the middleware thing 
function isAuthenticated( req,res,next){
    console.log( req.headers);
    if( typeof req.headers.authorization !== "undefined"){
        let token = req.headers.authorization.split(" ")[1];
        let privateKey = fs.readFileSync('./private.pem','utf8')
        
        jwt.verify(token,privateKey,{algorithm:"HS256"} , (err,user) => {
            if (err) {  
                // shut them out!
                res.status(500).json({ error: "Error in Authrozation Header" });
                throw new Error("Error in Authrozation Header");
            }
            return next();
        });
    }else {
        // No authorization header exists on the incoming
        // request, return not authorized and throw a new error 
        res.status(500).json({ error: "Authorization Header Undefined" });
        throw new Error("Not Authorized");
    }
}

module.exports = {isEmail:isEmail , isAuthenticated:isAuthenticated } ;