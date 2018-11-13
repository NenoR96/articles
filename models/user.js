const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
  name:{ type: String, required: true },
  email:{ type: String, required: true },
  username:{ type: String, required: true },
  password:{ type: String, required: true },
  admin:{ type: Boolean, required: false },
  img:{ type: String, required: true }
});

const User = module.exports = mongoose.model('User', UserSchema);
