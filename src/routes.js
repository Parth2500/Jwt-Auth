// routes.js

/**
 * @module routes
 */

/**
 * Load environment variables from .env file.
 * @requires dotenv
 */
require("dotenv").config();

/**
 * Express.js module for building web applications.
 * @external express
 * @see {@link https://expressjs.com/}
 */
const express = require("express");

/**
 * Express router for defining routes.
 * @type {external:express.Router}
 */
const router = express.Router();

/**
 * Library for hashing passwords.
 * @external bcrypt
 * @see {@link https://www.npmjs.com/package/bcrypt}
 */
const bcrypt = require("bcrypt");

/**
 * JSON Web Token library for user authentication.
 * @external jwt
 * @see {@link https://www.npmjs.com/package/jsonwebtoken}
 */
const jwt = require("jsonwebtoken");

/**
 * User model representing the MongoDB schema.
 * @type {module:models~User}
 * @see {@link module:models}
 */
const User = require("./models");

// Registration
/**
 * Handles user registration.
 * @function
 * @name POST /register
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Object} - JSON response indicating success or failure.
 */
router.post("/register", async (req, res) => {
  const { username, firstname, lastname, email, password, birthdate } =
    req.body;

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create a new user
  const newUser = new User({
    username,
    firstname,
    lastname,
    email,
    password: hashedPassword,
    birthdate,
  });

  try {
    // Save the user to the database
    const savedUser = await newUser.save();
    res.json({ message: "User registered successfully", user: savedUser });
  } catch (error) {
    res.status(500).json({ error: "Error registering user" });
  }
});

// Login
/**
 * Handles user login.
 * @function
 * @name POST /login
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Object} - JSON response containing a token and user information if successful.
 */
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find the user in the database
    const user = await User.findOne({ username });

    // Check if the user exists and the password is correct
    if (user && (await bcrypt.compare(password, user.password))) {
      // Create a JWT token
      const token = jwt.sign(
        { _id: user._id, username: user.username },
        process.env.JWT_SECRET,
        {
          expiresIn: "1h",
        }
      );

      res.json({
        token: token,
        user: { _id: user._id, username: user.username, email: user.email },
      });
    } else {
      res.status(401).json({ error: "Invalid username or password" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error logging in" });
  }
});

// User Update
/**
 * Handles user information update.
 * @function
 * @name PUT /update
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Object} - JSON response indicating success or failure.
 */
router.put("/update", authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const updatedUser = await User.findByIdAndUpdate(userId, req.body, {
      new: true,
    });
    res.json({
      message: "User information updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error updating user information" });
  }
});

/**
 * Middleware to authenticate the JWT token.
 * @function
 * @name authenticateToken
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next function.
 * @returns {void}
 */
async function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];

  try {
    if (!authHeader) {
      return res.sendStatus(401);
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.sendStatus(401);
    }

    const user = await jwtVerify(token);

    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    }
    res.sendStatus(403);
  }
}

/**
 * Asynchronously verifies the JWT token.
 * @function
 * @name jwtVerify
 * @param {string} token - JWT token to verify.
 * @returns {Promise<Object>} - Promise that resolves to the decoded user information.
 */
async function jwtVerify(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        reject(err);
      }
      resolve(user);
    });
  });
}

module.exports = router;
