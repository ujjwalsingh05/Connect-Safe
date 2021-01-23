const express = require("express");
const mysql = require("mysql");
const dotenv = require("dotenv");
const path = require('path');
const cookieParser = require('cookie-parser');

dotenv.config({path:'./.env'});     //we can also name this file like secret.env instead of just .env

const app = express();

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    port: 3307,                         //alwyas mention port no. to avoid any chance of error
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

//In publicDirectory, we will put files like CSS, JS files for frontend
const publicDirectory = path.join(__dirname, './public');           //__dirname is a nodejs variable which give address of current directory
//console.log(__dirname);

app.use( express.static(publicDirectory));        //to grab our static files like CSS or any such JS files

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: false}));

//Parse JSON bodies (the data from forms now come as json)
app.use(express.json());
app.use(cookieParser());

app.set('view engine','hbs');       //by default hbs user folder named views. so we created "views" folder


db.connect( (error) => {
    if(error) {
        console.log(error)
    } else{
        console.log("MYSQL Connected...")
    } 
})



//Define Routes
app.use('/', require('./routes/pages'));
app.use('/auth', require('./routes/auth'));

app.listen(5000, () => {
    console.log("Server started on Port 5000");
});
