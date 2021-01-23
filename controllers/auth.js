
const mysql = require("mysql");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { promisify } = require ('util');

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    port: 3307,                         //alwyas mention port no. to avoid any chance of error
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

exports.login = async (req, res) => {   // async-wait is used for the server to wait to complete some process which may take a while
    try {
        const { email, password } = req.body;

        if( !email || !password ){
            return res.status(400).render('login', {
                message: 'Please provide an email and password'
            })
        }

        db.query('SELECT * FROM users WHERE email = ?', [email], async (error, results) => {
            console.log(results);

            if( !results || !(await bcrypt.compare(password, results[0].password) )) {  //results array will atmost have one element becoz email is unique
                res.status(401).render('login', {
                    message: 'Email or Password is incorrect.'
                })
            } else {
                const id = results[0].id;   // here key:value pair is id: id. In js we can write only id

                // when a user logins a new token is created
                const token = jwt.sign({ id }, process.env.JWT_SECRET, {    //JWT_SECRET password will be used to create tokens
                    expiresIn: process.env.JWT_EXPIRES_IN   // 90 days
                });

                console.log("The token is: " + token);

                const cookieOptions = {
                    expires: new Date(
                        Date.now() + process.env.JWT_COOKIE_EXPRIES * 24 *60 * 60 *1000    // milliseconds in 90 days
                    ),
                    httpOnly: true  // to make sure we cookies when we are in http environment to prevent hacking
                }

                res.cookie('jwt', token, cookieOptions);    // setting up cookie in browser. you can use any name in place of 'jwt'
                res.status(200).redirect("/");
            }

        })
    } catch (error) {
        console.log(error);
    }

}

exports.register = (req, res) => {
    console.log(req.body);      //grabbing all data sent from form and logging on terminal

    // const name = req.body.name;
    // const email = req.body.email;
    // const password = req.body.password;
    // const passwordConfirm = req.body.passwordConfirm;

    //Destructuring in JS
    const {name, email, password, passwordConfirm} = req.body;

    db.query('SELECT email from users WHERE email = ?', [email], async (error,results) => {        // '?' will be replaced by the value [email]. And we also have a function that takes error or result
        if(error) {
            console.log(error);
        }

        if(results.length > 0)  {   //results is an array and if its length > 0, it means there is already an entry 
            return res.render('register', {
                message: 'That email is already in use.'
            })
 
        } 
        else if(password !== passwordConfirm){
            return res.render('register', {
                message: 'Passwords do not match.'
            }); 
        }

        let hashedPassword = await bcrypt.hash(password, 8);     //encrypting may take few seconds.  8 denotes rounds of encryption
        console.log(hashedPassword);

        db.query('INSERT INTO users SET ?', {name: name, email:email, Password: hashedPassword}, (error, results) => {
            if(error){
                console.log(error);
            } else {
                console.log(results);
                return res.render('register', {
                    message: 'User registered.'
                }); 
            }
        })

    });



    // res.send("Form submitted");
}

exports.isLoggedIn = async (req,res, next) => {
    // req.message = "Inside middleware";

    // console.log(req.cookies);
    if(req.cookies.jwt){
        try{
            // 1)verify the token
            const decoded =await promisify(jwt.verify) (req.cookies.jwt, process.env.JWT_SECRET); 

            console.log(decoded);

            // 2) check if the user still exists
            db.query('SELECT *FROM users WHERE id = ?', [decoded.id], (error, result) => {
                console.log(result);

                if(!result) {
                    return next();
                }

                req.user = result[0];
                return next();
            });
        } catch (error) {
            console.log(error);
            return next();
        }
 

     }
     else {
        next();
     }
    

}

exports.logout = async (req,res, next) => {
    res.cookie('jwt', 'logout', {       // setting up a new cookie and we have named it jwt. Can use any variable in place of 'logout' 
        expires: new Date(Date.now() + 2*1000),   // after clicking logout, the cookie will be deleted in 2 seconds 
        httpOnly: true
    });
    
    res.status(200).redirect('/'); 
}