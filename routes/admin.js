const express = require('express');
const router = express.Router();
const Category = require('../models/category');

router.get('/', function(err, res) {
    Category.find({}, function(err, cat){
        res.render("admin", { category: cat}); 
    });   
});

router.post('/category', function(req, res) {
    let category = new Category();
    category.title = req.body.title;
    category.save(function(err){
        if(err){
            console.log(err);
            return; } 
        else {
            res.redirect('/');
            console.log(category);
        }
    });
});

module.exports = router;
