const express = require('express');
const router = express.Router();
const Article = require('../models/article');
const Category = require('../models/category');

router.get('/:slug', function(req, res) {
    var title = req.params.slug;
    Category.findOne({"title": title}, function(err, category){
        Article.find({"category": category.title}).sort({"date": -1, "time": -1}).exec(function(err, articles) {
            if(err) { return console.log('erorr'); }    
            var artikli = [];
            var mjera = 3;
            for (var i = 0; i < articles.length; i += mjera){
                artikli.push(articles.slice(i, i + mjera));
            }            
            res.render("category", {category: category, articles: artikli});
        });
    });
}); 

router.post('/:slug/', function(req, res) {
    var sortBy = req.body.sortBy;
    var artikli = [];
    Category.findOne({"title": req.body.category}, function(err, category){
        Article.find({"category": category.title}, function(err, articles) {
            articles = articles.sort(function (a, b) {
                if(sortBy === "comments-less"){
                    return a.comments - b.comments;
                }
                else if(sortBy === "comments-most"){
                    return b.comments - a.comments;
                }
                else if(sortBy === "date-old"){
                    var d1 = new Date(a.date);var d2 = new Date(b.date);
                        return d1.getTime() - d2.getTime();
                } 
                else if(sortBy === "date-new"){
                    var d1 = new Date(a.date);var d2 = new Date(b.date);
                        return d2.getTime() - d1.getTime();
                }  
                return 0;
            });
            var mjera = 3;
            for (var i = 0; i < articles.length; i += mjera){
                artikli.push(articles.slice(i, i + mjera));
            }   
            res.render('category', { category: category, articles: artikli });
        });  
    });
}); 

module.exports = router;