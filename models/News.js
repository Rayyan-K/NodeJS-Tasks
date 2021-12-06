
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//const uniqueValidator = require('mongoose-unique-validator');

let NewsSchema = new Schema({
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
    collection: 'news'
})

module.exports = mongoose.model('news', NewsSchema)