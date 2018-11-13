const mongoose = require('mongoose');

const comment = mongoose.Schema({
    author:{ type: String, required: true },
    body:{ type: String, required: true}, 
    article:{ type: String, required: true},  
    date:{ type: String, required: true}
});

const Comment = module.exports = mongoose.model('Comment', comment);
