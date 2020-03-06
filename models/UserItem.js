var mongoose = require('mongoose');

var user = new mongoose.Schema({
    email:String,
    username:String,
    password:String,
    img:{ data: Buffer, contentType:String},
    firstName:{default:'', type:String},
    lastName:{type:String,default:''},
    age:{type:Number,default:0 },
    bio:{type:String, default:'Enter you Bio'},
})


module.exports = mongoose.model('user',user);
