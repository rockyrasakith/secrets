//jshint esversion:6
//require dotenv
require('dotenv').config()
//require express
const express = require("express");
//require ejs
const ejs = require("ejs");
//require body-parser
const bodyParser = require("body-parser");
//require mongoose
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/userDB', {useNewUrlParser: true, useUnifiedTopology: true});
const encrypt = require('mongoose-encryption');


//run express
const app = express();

//check to see if db connection is ok
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    // we're connected!
});

//set the ejs engine
app.set('view engine', 'ejs');
//use the body parser
app.use(bodyParser.urlencoded({
    extended: true
}));
//public route for express
app.use(express.static("public"));

//mongoose schemas
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});



//add the encrypt plugin
userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password'] });

const User = new mongoose.model('User', userSchema);

//render the homepage
app.get("/", function (req, res) {
    res.render("home");
});
//render the register page
app.get("/register", function (req, res) {
    res.render("register");
})
//render the login page
app.get("/login", function (req, res) {
    res.render("login");
});

//user post API to Create new User
app.post("/register", function(req, res){
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    });

    newUser.save(function(err){
        if (err) {
            console.log(err);
        } else {
            res.render("secrets");
        }
    });
});

//user login API to check for credentials
app.post("/login", function(req, res){
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({email: username}, function(err, foundUser){
        if (err) {
            console.log(err);
        } else {
            if (foundUser) {
                if (foundUser.password === password) {
                    res.render("secrets");
                } else {
                    res.send("<h1>Wrong Password!</h1>");
                }
            }
        }
    });
});


//listen on the port 3000
app.listen(3000, function () {
    console.log("Server started on port 3000");
});