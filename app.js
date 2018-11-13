const express = require('express');
const path = require('path');
const expressHbs = require('express-handlebars');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const session = require('express-session');
const passport = require('passport');
const hbs = require('handlebars');

mongoose.connect('mongodb://localhost:27017/articlesdb');
//================================================================================================
const app = express();
app.set('views',path.join(__dirname,'views'))
app.engine('.hbs', expressHbs({defaultLayout: 'layout', extname: '.hbs'}));
app.set('view engine', '.hbs');
//HANDLEBARS======================================================================================
hbs.registerHelper('ifEquals', function(a, b, options) {
  if (a === b) {
    return options.fn(this);
  }
  return options.inverse(this);
});
//================================================================================================
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));
//EXPRESS-SESSION=================================================================================
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));

app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));
//PASSPORT========================================================================================
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());
app.get('*', function(req, res, next){
  res.locals.user = req.user || null;
  next();
});
//================================================================================================
let index = require('./routes/index');
let articles = require('./routes/articles');
let users = require('./routes/users');
let categories = require('./routes/categories');
let admin = require('./routes/admin');
app.use('/', index);
app.use('/articles', articles);
app.use('/user', users);
app.use('/category', categories);
app.use('/admin', admin);
//================================================================================================
app.listen(3000, function(){
  console.log('Server started on port 3000...');
});