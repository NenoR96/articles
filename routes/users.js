const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const multer = require('multer');
const fs = require('fs');

let User = require('../models/user');
let Article = require('../models/article');
let Comments = require('../models/comment');

const storage = multer.diskStorage({
  destination: 'public/images/profiles',
  filename: function(req, file, next){
      next(null, Date.now() + '-' + file.originalname);
  },
  fileFilter: function (req, file, callback) {
  var ext = path.extname(file.originalname);
  if(ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
      return callback(new Error('only images are allowed'))
  }
  callback(null, true)
  },
  limits:{
      fileSize: 1024 * 1024
  }  
});

const upload = multer({ storage: storage});
//================================================================================================
router.get('/register', function(req, res){
  res.render('register');
});

router.post('/register', function(req, res){
  const name = req.body.name;
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;

  req.checkBody('name', 'Name is required').notEmpty();
  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('email', 'Email is not valid').isEmail();
  req.checkBody('username', 'Username is required').notEmpty();
  req.checkBody('password', 'Password is required').notEmpty();

  let errors = req.validationErrors();

  if(errors){
    res.render('register', {
      errors:errors
    });
  } else {
    let newUser = new User({
      img: "/images/user.png",
      name:name,
      email:email,
      username:username,
      password:password
    });

    bcrypt.genSalt(10, function(err, salt){
      bcrypt.hash(newUser.password, salt, function(err, hash){
        if(err){
          console.log(err);
        }
        newUser.password = hash;
        newUser.save(function(err){
          if(err){
            console.log(err);
            return;
          } else {
            res.redirect('/user/login');
          }
        });
      });
    });
  }
});
//================================================================================================
router.get('/login', function(req, res){
  res.render('login');
});

router.post('/login', function(req, res, next){
  passport.authenticate('local', {
    successRedirect:'/',
    failureRedirect:'/user/login',
    failureFlash: true
  })(req, res, next);
});

router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/user/login');
});
//================================================================================================
router.get('/profile/:id', function(req, res){
      User.findById(req.params.id, function(err, user)
      {
        if(err) { return console.log("user not found"); }
        Article.find({"author": user.id}).sort({"date": -1, "time": -1}).exec(function(err, articles) { 
          var artikli = [];
          var mjera = 3;
          for (var i = 0; i < articles.length; i += mjera){
              artikli.push(articles.slice(i, i + mjera));              
          }           
          Comments.find({"author": user.username},function(err, comments) 
          {       
            var state = Boolean; if(req.isAuthenticated(user) === true) { state = true; } else { state = false; }
            if(err) { return console.log("article not found"); }
            res.render('profile', { users: user, articles: artikli, comments: comments, state: state});            
          });
        }); 
    });
});

router.post('/profile/:id', upload.single('myImage'), function(req, res){
  let user = new User();
  user = req.user;
  user.email = req.body.email;
  if(req.file){
    fs.unlink('./public' + user.img, function(err){
      if(err) return console.log(err);
      console.log('file deleted successfully');
    }); 
    var path = req.file.path;
    path = path.replace(/\\/g, "/").replace(/public/g, "")
    user.img = path;  
  }
  user.admin = true;

  let query = {_id:req.params.id};
  User.update(query, user, function(err){
    if(err){
      console.log(err); return;
    } else { 
      res.redirect('/user/profile/' + query._id);
    }
  });
});


module.exports = router;
