const express = require("express");
const path = require("path");
const crypto = require("crypto");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");
const methodOverride = require("method-override");
const passport = require("passport");
const cors = require("cors");

const client = require("./routes/api/client");

const posts = require("./routes/api/posts");

const app = express();
// body parse middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
//DB Config
const db = require("./config/keys").mongoURI;

// connect to mongodb

mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Create storage engine

//Passport Middleware
app.use(passport.initialize());

//Passport Config
require("./config/passport")(passport);

//Use routes

app.use("/api/posts", posts);
app.use("/api/client", client);

const port = process.env.PORT || 4000;

app.listen(port, () => console.log(`server running on port ${port}`));
