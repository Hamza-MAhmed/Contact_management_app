var express = require('express');
var router = express.Router();
var error = require("http-errors")
const {connectDB , userModel} = require('../db/users.js');
const contactModel = require('../db/contacts.js');
const passport = require("passport");
const localStrategy = require("passport-local");
passport.use(new localStrategy(userModel.authenticate()));
const popup = require('node-popup');


router.get('/', function(req, res, next) {
  res.render('index');
});
router.post("/register", async function(req , res) {
  const { username, email, password } = req.body;

  // Create a new user with the provided data
  const newUser = new userModel({ username, email });

  if(await (userModel.findOne({email : newUser.email}))){
    return res.send("Already registered")
  }

  // Register the user with Passport.js
  userModel.register(newUser, password, function(err, user) {
    if (err) {
      console.error(err);
      return res.status(500).send("Error registering user");
    }
    // Authenticate the newly registered user
    passport.authenticate("local")(req , res , function() {
      // Redirect the user back to the home page
      res.redirect("/user");
    });
  });
});

router.get('/login', function(req, res, next){
  res.render("login")
})


router.post("/login" , passport.authenticate("local" , {
  successRedirect: "/user/profile" ,
  failureRedirect: "/user/login",
  //failureFlash : true
}), function(req , res){
});
router.get('/logout' , function(req , res, next){
  req.logout(function(err) {
    if (err) {return next(err); }
    res.redirect('/');
  });
});

router.get('/profile' ,isLoggedIn, async function(req , res , next){
  // popup.alert({content:"hi"})
  // const alertScript = "<script>alert('hi');</script>";
  const user = await userModel.findOne({
    username: req.session.passport.user
  })
  var query = "";
  //console.log(user);
  res.render("profile", {user,query});
})

router.post("/search", isLoggedIn, async function(req, res, next) {

  query = req.body.query;
  query = query.toString();
  try{
    const existing_user = req.session.passport.user;
    console.log(existing_user)
    const id = await userModel.findOne({username : existing_user})
    console.log(id)
    const results = await contactModel.find({name : {$regex: query, $options: 'i'}, user : id._id})
    
    res.render('search', { results, query }); // Render search results page with results and query
    } catch (error) {
        console.error('Error searching contacts:', error);
        res.status(500).send('Internal server error');
    }
});

router.get("/logout", function(req, res, next) {
  console.log("haxx")
  req.logout(function(err) {
    if (err) { return next(err);
    console.log("dfsafsdfsd") }
    console.log("asdddd")
    res.redirect('/user/login');
  });
})

function isLoggedIn(req, res,next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}
module.exports = {router , isLoggedIn};


