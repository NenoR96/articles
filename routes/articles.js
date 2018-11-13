const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');

let Article = require('../models/article');
let User = require('../models/user');
let Comments = require('../models/comment');
let Category = require('../models/category');

const storage = multer.diskStorage({
  destination: 'public/images/articles',
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
//==============================================================================
router.get('/add', ensureAuthenticated, function(req, res){
  Category.find({}, function(err, category) {
  res.render('add_article', { title:'Add Article', categories: category });
  });
});

router.post('/add', upload.single('myImage'), function(req, res){
  req.checkBody('title','Title is required').notEmpty();
  req.checkBody('body','Body is required').notEmpty();

  let errors = req.validationErrors();
  if(errors){
    res.render('add_article', { title:'Add Article', errors:errors });
  } else {
    let article = new Article();
    article.title = req.body.title;
    article.author = req.user._id;
    article.body = req.body.body;
    article.descript = req.body.descript;
    article.category = req.body.category;  
    article.date = getDate();
    article.time = getTime();
    article.comments = 0;   
    if(!req.file){
      article.img = "/images/" + req.body.category + ".jpg";     
    }
    else {
      var path = req.file.path;
      path = path.replace(/\\/g, "/").replace(/public/g, "")
      article.img = path;     
    }
    article.save(function(err){
      if(err){
        console.log(err); return;
      } else { res.redirect('/'); }
    });
  }
});
//==============================================================================
router.get('/edit/:id', ensureAuthenticated, function(req, res){
  Article.findById(req.params.id, function(err, article){
    if(article.author != req.user._id){
      res.redirect('/');
    }
    res.render('edit_article', { title:'Edit Article', article: article });
  });
});

router.post('/edit/:id', upload.single('myImage'), function(req, res){
  let article = {};
  article.title = req.body.title;
  article.descript = req.body.descript;
  article.author = req.user._id;
  article.body = req.body.body;
  article.img = req.body.img;  
  if(req.file){
    fs.unlink('./public' + article.img, function(err){
      if(err) return console.log(err);
      console.log('file deleted successfully');
    }); 
    var path = req.file.path;
    path = path.replace(/\\/g, "/").replace(/public/g, "")
    article.img = path;  
  }
  let query = {_id:req.params.id};
  Article.update(query, article, function(err){
    if(err){
      console.log(err);
      return;
    } else { 
      res.redirect('/articles/' + query._id);
    }
  });
});
//==============================================================================
router.post('/delete/:id', function(req, res){
  Article.findById(req.params.id, function(err, article){ 
    Comments.find({"article": article._id}, function(err, comments){ 
      for (var i = 0; i < comments.length; i ++){
        comments[i].remove({}, function(err){
          if(err){console.log('error');}
        });
      }   
    });
    article.remove({}, function(err){
      if(err){
        console.log('error');
      }
      res.redirect('/');
    });
  });
});
//==============================================================================
router.get('/:id', function(req, res){
  var liked = [];
  var state = Boolean; 
  Article.findById(req.params.id).populate('liked.user').exec(function(err, article){
    if(err) { return console.log('error'); }
    for (var i = 0; i < article.liked.length; i++) {
      User.findOne({"_id": article.liked[i]}, function(err, liker){
        liked.push(liker.name);
        if(liker.name === req.user.name) { state = true; }
      });
    }
    Comments.find({"article": article._id}).sort({"date": -1}).exec(function(err, comments){ 
      if(err) { return console.log(err); }
        User.findOne({"_id": article.author}, function(err, users){
          if(err) { return console.log(err); }    
          res.render('article', 
          { article: article, comments: comments, author: users, liked: liked, state: state }); 
        });  
    });
  });
});

router.post('/:id', function(req, res){
  Article.findById(req.params.id, function(err, article){ 
    if(req.isAuthenticated() === false) { return res.redirect('/'); }
    else {
      req.checkBody('body','Body is required').notEmpty();
      let comment = new Comments();
      let date = new Date();
      comment.author = req.user.username;
      comment.body = req.body.body;
      comment.article = req.body.article;
      comment.date = date;
      article.comments++;
      article.save(function(err){
        if(err) { console.log(err); return; }
        else { console.log('saved succesfully'); }  
        comment.save(function(err){
          if(err) { console.log(err); return; }
          else {
            let Url = '/articles/' + comment.article;
            res.redirect(301, Url);
          }  
        }); 
      }); 
    }   
  });
});
//==============================================================================
router.post('/liked/:id', function(req, res){
  var state = req.body.state;
  Article.findById(req.params.id, function(err, article){ 
    if(state) { article.liked.remove(req.user._id); }
    else { article.liked.push(req.user._id); }
    article.save(function(err){
      if(err) { console.log(err); return;}
      else { console.log('deleted succesfully'); console.log(article); res.redirect("/"); }  
    });
  });
});
//==============================================================================
function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next();
  } else {
    res.redirect('/user/login');
  }
}

function getDate() {

  var date = new Date();

  var year = date.getFullYear();

  var month = date.getMonth() + 1;
  month = (month < 10 ? "0" : "") + month;

  var day  = date.getDate();
  day = (day < 10 ? "0" : "") + day;

  return year + "/" + month + "/" + day;
}

function getTime() {
  var date = new Date();

  var hour = date.getHours();
  hour = (hour < 10 ? "0" : "") + hour;

  var min  = date.getMinutes();
  min = (min < 10 ? "0" : "") + min;
  return hour + ":" + min;
}

module.exports = router;
