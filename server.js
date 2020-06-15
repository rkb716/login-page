"use strict";

const express = require("express");

const mongo = require("mongodb").MongoClient;

const routes = require("./routes.js");
const auth = require("./auth.js");

const app = express();

app.use("/public", express.static(process.cwd() + "/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "pug");

mongo.connect(process.env.DATABASE, (err, client) => {
  var db = client.db(process.env.DATABASE_NAME);
  if (err) {
    console.log("Database error: " + err);
    return;
  } else {
    console.log("Successful database connection");
  }
  auth(app, db);
  routes(app, db);

  app.use((req, res, next) => {
    res
      .status(404)
      .type("text")
      .send("Not Found");
  });

  app.listen(process.env.PORT || 3000, () => {
    console.log("Listening on port " + process.env.PORT);
  });
});
