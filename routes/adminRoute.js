const express = require("express");
const admin_route = express();
const session = require("express-session");
const config = require("../config/config");
const bodyParser = require("body-parser");
const auth = require("../middleware/adminAuth");
const adminController = require("../controllers/adminController");

// Configuring middleware
admin_route.use(
  session({
    secret: config.sessionSecret,
    saveUninitialized: true,
    resave: false,
  })
);

//  middleware
admin_route.use(bodyParser.json());
admin_route.use(bodyParser.urlencoded({ extended: true }));

// Setting view
admin_route.set("view engine", "ejs");
admin_route.set("views", "./views/admin");

// --- Routing ---

// Login route
admin_route.get("/", auth.isLogout, adminController.loadLogin);
admin_route.post("/", adminController.verifyLogin);

// Dashboard route
admin_route.get("/home", auth.isLogin, adminController.loadDashboard);

// New user route
admin_route.get("/new-user", auth.isLogin, adminController.newUserLoad);
admin_route.post("/new-user", adminController.addUser);

// Logout route
admin_route.get("/logout", auth.isLogin, adminController.logout);

// Admin dashboard route
admin_route.get("/dashboard", auth.isLogin, adminController.adminDashboard);

// Edit user route
admin_route.get("/edit-user", auth.isLogin, adminController.editUser);
admin_route.post("/edit-user", adminController.updateUser);

// Delete user route
admin_route.get("/delete-user", adminController.deleteUser);

// Redirect to /admin for any unmatched routes
admin_route.get("*", (req, res) => {
  res.redirect("/admin");
});

module.exports = admin_route;
