// models.js

/**
 * Load environment variables from .env file.
 * @requires dotenv
 */
require("dotenv").config(); // Load environment variables from .env file

/**
 * Mongoose library for MongoDB interactions.
 * @external mongoose
 * @see {@link https://mongoosejs.com/}
 */
const mongoose = require("mongoose");

/**
 * Connect to MongoDB using the provided URI.
 * @function
 * @name connectToDatabase
 * @param {string} process.env.MONGODB_URI - The MongoDB URI.
 * @param {Object} options - Additional options for MongoDB connection.
 * @returns {Promise} - A promise that resolves when the connection is established.
 */
mongoose.connect(process.env.MONGODB_URI, {
  autoIndex: process.env.NODE_ENV !== "production", // Disable automatic index creation in production for improved performance
});

/**
 * Represents the schema for the User model.
 * @typedef {Object} UserSchema
 * @property {string} username - The unique username of the user.
 * @property {string} firstname - The first name of the user.
 * @property {string} lastname - The last name of the user.
 * @property {string} email - The email address of the user.
 * @property {string} password - The hashed password of the user.
 * @property {Date} birthdate - The birthdate of the user.
 * @property {number} age - The calculated age of the user.
 * @property {string} location - The location of the user.
 * @property {boolean} isActive - Indicates whether the user is active.
 * @property {string} bio - The biography of the user.
 * @property {string} profilePicture - The URL of the user's profile picture.
 * @property {Date} createdAt - The date when the user was created.
 * @property {Date} modifiedAt - The date when the user was last modified.
 */

/**
 * Mongoose schema for the User model.
 * @type {external:mongoose.Schema<UserSchema>}
 */
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

/**
 * Middleware: Calculate age before saving the user to the database.
 * @function
 * @name calculateAge
 * @memberof external:mongoose.Schema
 * @param {Function} next - The Mongoose middleware function to proceed with the saving process.
 * @returns {void}
 */
userSchema.pre("save", function (next) {
  const currentDate = new Date();
  const birthdate = new Date(this.birthdate);

  // Calculate age more accurately, considering whether the birthday has passed in the current year
  const ageDiff = currentDate.getFullYear() - birthdate.getFullYear();
  const isBirthdayPassed =
    currentDate.getMonth() > birthdate.getMonth() ||
    (currentDate.getMonth() === birthdate.getMonth() &&
      currentDate.getDate() >= birthdate.getDate());

  // Assign the calculated age to the 'age' field
  this.age = isBirthdayPassed ? ageDiff : ageDiff - 1;

  // Continue with the saving process
  next();
});

/**
 * Mongoose model for the User schema.
 * @type {external:mongoose.Model<UserSchema>}
 */
const User = mongoose.model("User", userSchema);

/**
 * Export the User model.
 * @exports User
 */
module.exports = User;
