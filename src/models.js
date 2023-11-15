// models.js

require("dotenv").config(); // Load environment variables from .env file
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGODB_URI, {
  autoIndex: process.env.NODE_ENV !== "production", // Disable automatic index creation in production for improved performance
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  birthdate: {
    type: Date,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  location: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  bio: {
    type: String,
  },
  profilePicture: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  modifiedAt: {
    type: Date,
  },
});

// Calculate age before saving
userSchema.pre("save", function (next) {
  const currentDate = new Date();
  const birthdate = new Date(this.birthdate);
  this.age = Math.floor((currentDate - birthdate) / 31557600000); // Approximate milliseconds in a year
  next();
});

module.exports = mongoose.model("User", userSchema);
