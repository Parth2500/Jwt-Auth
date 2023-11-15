// server.js

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
 * Body parsing middleware for handling JSON data.
 * @external bodyParser
 * @see {@link https://www.npmjs.com/package/body-parser}
 */
const bodyParser = require("body-parser");

/**
 * Routes module defining the API routes.
 * @type {module:routes}
 * @see {@link module:routes}
 */
const routes = require("./routes");

/**
 * Express application instance.
 * @type {external:express.Application}
 */
const app = express();

/**
 * The port on which the server will listen.
 * @type {number}
 * @default 3000
 */
const PORT = process.env.PORT || 3000;

// Middleware to parse incoming JSON requests
app.use(bodyParser.json());

// Routes for API endpoints
app.use("/api", routes);

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
