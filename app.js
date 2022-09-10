//jshint esversion:6
require('dotenv').config()  //put on top..
// console.log(process.env) // remove this after you've confirmed it working
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

//db part
mongoose.connect("mongodb://localhost:27017/userDB");

// const userSchema = {
//   email: String,
//   password: String
// };

const userSchema = new mongoose.Schema ({  // not simple objec but new schema objc create from mongo schema class
  email: String,
  password: String
});

//const secret = "xxxxxx"; // moved this to .env dotenv package.. for more secure
userSchema.plugin(encrypt, { secret: process.env.secret, encryptedFields: ["password"] });
// this need to be b4 mongo.model!!, and only choose to encryp password field only.

const User = new mongoose.model ("User", userSchema); // PS feil need to use schemname from system windows popup.

//app.get/post part

app.get("/", function (req, res) {
  res.render("home");
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.get("/register", function (req, res) {
  res.render("register");
});

app.post("/register", function(req, res) {
  const newUser = new User({
    email: req.body.username,
    password: req.body.password
  });

  newUser.save(function(err) {
    if (err) {
      console.log(err);
    } else {
      res.render("secrets"); // PS! render bare user to secrets hvis den gikk ok gjennom register!! HUSK!!
    }
  });
});

  app.post("/login", function(req, res) {
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({email: username}, function(err, foundUser) {
      if (err) {
        console.log(err); // log if error
      } else {
        if (foundUser) {   //founduser er hele doc email og pass og id.
          if (foundUser.password === password) {
            console.log(foundUser);
            console.log(foundUser.password); // can see mongo decrypted ok
            res.render("secrets")
          }
        }
      }
    });
  });

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
