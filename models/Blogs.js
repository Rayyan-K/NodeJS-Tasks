
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//const uniqueValidator = require('mongoose-unique-validator');

let BlogsSchema = new Schema({
    title: {
        type: String
   
    },
    content: {
        type: String

    },
    image: {
        type: String
    }
}, {
    collection: 'blogs'
})

module.exports = mongoose.model('blogs', BlogsSchema)