// this page is to handle all the routes to webpages

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');

//get is an HTTP method used to render pages on browser

router.get('/', authController.isLoggedIn, (req,res) => {
    res.render('index', {
        user:req.user
    });       //no need to write "index.hbs"
});

router.get('/register', (req,res) => {
    res.render('register');
});

router.get('/login', (req,res) => {
    res.render('login');
});

// Before rendering profile page we need to check if the user is logged in. For this we nned to check token and also if this token corresponds to that user. So we will create middleware
router.get('/profile', authController.isLoggedIn, (req,res) => {
    // console.log(req.message);
    if(req.user) {
        res.render('profile', {
            user: req.user
        });
    } else {
        res.redirect('/login');
    }
   
});

module.exports = router;
