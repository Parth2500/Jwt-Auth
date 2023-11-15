// routes.js

require("dotenv").config(); // Load environment variables from .env file
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const jose = require("node-jose");
const User = require("./models");
let privateKey = {};

createJoseKey()
  .then((joseKey) => {
    privateKey = joseKey;
  })
  .catch((error) => {
    console.error("Error in yourAsyncFunction:", error);
  });

// Registration
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
        token: await encryptToken(token),
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
router.put("/update", authenticateToken, async (req, res) => {
  // Assuming the authenticated user's information is available in req.user
  const userId = req.user._id;

  // Update user information based on the request body
  try {
    const updatedUser = await User.findByIdAndUpdate(userId, req.body, {
      new: true,
    });
    res.json({
      message: "User information updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ error: "Error updating user information" });
  }
});

// Middleware to authenticate the JWT token
async function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.sendStatus(401);
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.sendStatus(401);
  }

  try {
    // Decrypt the token using the private key
    const decryptedToken = await decryptToken(token);

    // Verify the signature of the decrypted payload using the public key
    jwt.verify(decryptedToken, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      req.user = user;
      next();
    });
  } catch (error) {
    console.error(error);
    res.sendStatus(403);
  }
}

async function createJoseKey() {
  try {
    // Create a new key store
    const keystore = jose.JWK.createKeyStore();

    // Generate a key with the specified parameters
    const key = await keystore.generate("oct", 256, { alg: "A256GCM" });

    console.log("JOSE Key created successfully:", key.toJSON());
    return key;
  } catch (error) {
    console.error("Error creating JOSE Key:", error);
    throw error;
  }
}

// Function to encrypt a token using JWE
async function encryptToken(token) {
  try {
    const encryptedToken = await jose.JWE.createEncrypt(
      { format: "compact", cleartext: Buffer.from(token) },
      { key: privateKey }
    )
      .update(token)
      .final();

    return encryptedToken;
  } catch (error) {
    console.error(error);
    throw new Error("Error encrypting token");
  }
}

// Function to decrypt an encrypted token using JWE
async function decryptToken(encryptedToken) {
  try {
    // Decrypt the token using the private key
    const decryptedToken = await jose.JWE.createDecrypt(privateKey).decrypt(
      encryptedToken
    );

    return decryptedToken.payload.toString();
  } catch (error) {
    console.error(error);
    throw new Error("Error decrypting token");
  }
}

module.exports = router;
