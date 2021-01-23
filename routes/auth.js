const express = require('express');
const authController = require('../controllers/auth');

const router = express.Router();
//get is an HTTP method used to render pages on browser

router.post('/register', authController.register)     // it has actually now become /auth/register
    
router.post('/login', authController.login);

router.get('/logout', authController.logout );


module.exports = router;
