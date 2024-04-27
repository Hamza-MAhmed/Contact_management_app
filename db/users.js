var express = require('express');
var router = express.Router();

const mongoose = require('mongoose');
const plm = require("passport-local-mongoose");
const Contact = require('./contacts');
// const connectDB = function() {}
const connectDB = async () => {
  try {
    const res = await mongoose.connect(process.env.MONGOURL);
    console.log('Mongo DB connected');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};


const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: false
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
  },
  contacts:[{
    type : mongoose.Schema.Types.ObjectId,
    ref: Contact
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.plugin(plm , { usernameUnique: false });

const userModel = mongoose.model('User', userSchema);
//const User = mongoose.model('User', userSchema);
//module.exports = User;
module.exports = {
  connectDB,
  userModel
}
