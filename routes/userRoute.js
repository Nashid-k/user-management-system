
const express = require("express");
const user_route = express();
const session = require("express-session");
const config = require("../config/config");
const auth = require("../middleware/auth");
const path = require("path");
const bodyParser = require("body-parser");
const userController = require("../controllers/userController");

// configuring session middleware
user_route.use(
  session({
    secret: config.sessionSecret,
    saveUninitialized: true,
    resave: false,
  })
);

// Setting view 
user_route.set("view engine", "ejs");
user_route.set("views", "./views/users");

// middleware
user_route.use(bodyParser.json());
user_route.use(bodyParser.urlencoded({ extended: true }));

// --- Routing ---

// Registration routes
user_route.get("/register", auth.isLogout, userController.loadRegister);
user_route.post("/register", userController.insertUser);

// Login routes
user_route.get("/", auth.isLogout, userController.loginLoad);
user_route.get("/login", auth.isLogout, userController.loginLoad);
user_route.post("/login", userController.verifyLogin);

// Home route
user_route.get("/home", auth.isLogin, userController.loadHome);

// Logout route
user_route.get("/logout", auth.isLogin, userController.userLogout);

// Create account route
user_route.get("/createAccount", auth.isLogout, userController.loadRegister);

// Edit account routes
user_route.get("/edit", auth.isLogin, userController.editProfile);
user_route.post("/update", userController.updateProfile);

module.exports = user_route;
