const express = require('express');
const router = express.Router();
const Article = require('../models/article');
const Category = require('../models/category');

router.get("/", function(req, res) {
  var artikli = [];
  var load = 0;
  Category.find({}, function(err, category) {
    for(var i= 0; i < category.length; i ++){
      Article.find({"category": category[i].title}).sort({"date": -1, "time": -1}).exec(function(err, articles) {
        load ++;
        articles = articles.slice(0, 3);
        artikli.push(articles);
        if(load === category.length) {
          res.render("index", { categories: category, articles: artikli});
        }
      });
    }  
  });  
});

module.exports = router;