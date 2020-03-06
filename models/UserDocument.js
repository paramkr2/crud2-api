const mongoose = require('mongoose')

let document = new mongoose.Schema({
    username:String,
    documents:[{
        title: String,
        content:String,
        timeStamp : {type:Number , default: (new Date()).getTime() }
    }]
})

module.exports = mongoose.model('document',document);