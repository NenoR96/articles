let mongoose = require('mongoose');

let categorySchema = mongoose.Schema({
  title:{ type: String, required: true },
  img:{type: String, required: true}
});

let Category = module.exports = mongoose.model('Category', categorySchema);
