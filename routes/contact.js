var express = require('express');
var router = express.Router();
var error = require("http-errors")
const {userModel} = require('../db/users.js');
const contactModel = require('../db/contacts.js');
const passport = require("passport");
const localStrategy = require("passport-local");
const { isLoggedIn } = require('./user.js');
passport.use(new localStrategy(userModel.authenticate()));

router.get("/", isLoggedIn , function(req , res , next) {
  res.render('contacts')
})

router.get("/add_contact", isLoggedIn , function(req , res , next) {
  res.render('add_contact.ejs')
})
router.post("/add_contact", async function(req , res , next) {
  if (req.body.action === "add"){
  const { name, email, phoneNumber, address } = req.body;
  
  const newContact = new contactModel({ name, email, phoneNumber, address });
  const existing_user = await userModel.findOne({username: req.session.passport.user});

  if(await (contactModel.findOne({name : newContact.name, user : existing_user})) || await (userModel.findOne({phoneNumber : newContact.phoneNumber}))){
    // res.redirect('back')
    // return res.send("Already exist")
    res.render('add_contact' ,{ error: 'Please enter a username.' })
    return;
  }
  existing_user.contacts.push(newContact._id);
  newContact.user = existing_user._id
  await newContact.save();
  await existing_user.save();
  res.redirect("/contact/add");
}
})

router.get("/del_contact",isLoggedIn, function(req , res , next) {
  res.render("del_contact.ejs")
})

router.post("/del_contact", async function(req , res , next) {
  // if (req.body._method && req.body._method === "DELETE") {

  const fullname = req.body.name;
  console.log(fullname)
  const existing_user = await userModel.findOne({username: req.session.passport.user});
  const user_obj = await userModel.findOne({username : existing_user})

  const contact = await contactModel.findOne({name : fullname , user : existing_user._id});
  if (contact){
    const id = contact._id;
    console.log(id)
    const index = existing_user.contacts.indexOf(id);
    if (index != -1){
      existing_user.contacts.splice(index , 1);
      
      await existing_user.save();
      await contactModel.deleteOne({ _id : id })
      await existing_user.save();

      res.redirect("/contact/delete");
    }
    else{
      return res.send("no such contact")
    }
  }
  else{
    return res.send("no such contact")
  }
})

router.get("/add", function(req , res , next){
  res.send("added")
})
router.get("/delete" , function(req , res , next) {
  res.send("deleted");
})

router.get("/mycontacts" ,isLoggedIn, async function(req , res , next) {
  const user = await userModel.findOne({
    username: req.session.passport.user
  })
  .populate('contacts')
  res.render('mycontacts.ejs', {user})
})
module.exports = router;