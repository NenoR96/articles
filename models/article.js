let mongoose = require('mongoose');

let articleSchema = mongoose.Schema({
  title:{ type: String, required: true },
  author:{ type: String, required: true },
  descript:{ type: String, required: true}, 
  body:{ type: String, required: true}, 
  category:{ type: String, required: true},  
  date:{ type: String, required: true},
  time:{ type: String, required: true},
  comments:{ type: Number, required: true},
  img:{type: String, required: false},
  liked: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }]
});

let Article = module.exports = mongoose.model('Article', articleSchema);
