"use strict";

require('dotenv').config();
const ENV          = process.env.ENV || "development";
const PORT         = process.env.PORT || 8080;

const express     = require("express");
const bodyParser  = require("body-parser");
const sass        = require("node-sass-middleware");
const knexConfig  = require("./knexfile");
const knex        = require("knex")(knexConfig[ENV]);
const uuidV4      = require ("uuid/v4");

// const keyPublishable = process.env.PUBLISHABLE_KEY;
// const keySecret = process.env.SECRET_KEY;
// const stripe = require("stripe")(keySecret);

// Seperated Routes for each Resource
const Routes       = require("./routes/routes");
const twilioRoutes = require("./routes/twilio");


const app = express();
// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
// Log knex SQL queries to STDOUT as well
//morgan and knexLogger are dev dependencies so outside of dev env we dont require them.
if (ENV === 'development') {
  const morgan = require('morgan');
  app.use(morgan('dev'));
  const knexLogger = require('knex-logger');
  app.use(knexLogger(knex));
}

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));

app.use("/styles", sass({
  src: __dirname + "/styles",
  dest: __dirname + "/public/styles",
  debug: true,
  outputStyle: 'expanded'
}));

app.use(express.static("public"));

// Mount all resource routes
app.use("/", Routes(knex));
app.use("/call", twilioRoutes(knex));

app.listen(PORT, () => {
  console.log("Example app listening on port " + PORT);
});
