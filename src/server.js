// server.js

require('dotenv').config(); // Load environment variables from .env file
const express = require("express");
const bodyParser = require("body-parser");
const routes = require("./routes");


const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use("/api", routes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
