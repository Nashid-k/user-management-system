const User = require("../models/userModel");
const bcrypt = require("bcrypt");

//securely hash the password
const securePassword = async (password) => {
  try {
    const passwordHsash = await bcrypt.hash(password, 6);
    return passwordHsash;
  } catch (error) {
    console.log(error.message);
  }
};

//render the login page
const loadLogin = async (req, res) => {
  try {
    res.render("login");
  } catch (error) {
    console.log(error.message);
  }
};

//verify login 
const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const userData = await User.findOne({ email: email });
    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);
      if (passwordMatch) {
        if (userData.is_admin === 0) {
          res.render("login", { message: "Email or password is incorrect" });
        } else {
          req.session.user_id = userData._id;
          res.redirect("/admin/home");
        }
      } else {
        res.render("login", { message: "Email or password is incorrect" });
      }
    } else {
      res.render("login", { message: "Email or password is incorrect" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// render the admin dashboard
const adminDashboard = async (req, res) => {
  try {
    const usersData = await User.find({ is_admin: 0 });
    res.render("dashboard", { users: usersData });
  } catch (error) {
    console.log(error.message);
  }
};

//load the admin dashboard with userData
const loadDashboard = async (req, res) => {
  try {
    const userData = await User.findById({ _id: req.session.user_id });
    res.render("home", { admin: userData });
  } catch (error) {
    console.log(error.message);
  }
};

// user logout
const logout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/admin");
  } catch (error) {
    console.log(error.message);
  }
};

//load the new user registration page
const newUserLoad = (req, res) => {
  try {
    res.render("new-user");
  } catch (error) {
    console.log(error.message);
  }
};

// add a new user
const addUser = async (req, res) => {
  try {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const cpassword = req.body.cpassword;

    // Check for whitespace in any field
    if (/^\s*$/.test(name) || /^\s*$/.test(email) || /^\s*$/.test(password)) {
      return res.render("new-user", {
        message: "Whitespace is not allowed in any field",
      });
    }

    const spassword = await securePassword(password);
    const user = new User({
      name: name,
      email: email,
      password: spassword,
      cpassword: spassword,
      is_admin: 0,
    });

    const userData = await user.save();
    if (userData) {
      res.redirect("/admin/dashboard");
    } else {
      res.render("new-user", { message: "Something is wrong" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// render the edit user page
const editUser = async (req, res) => {
  try {
    const id = req.query.id;

    const userData = await User.findOne({ _id: id });
    if (userData) {
      res.render("edit-user", { user: userData });
    } else {
      res.redirect("/admin/dashboard");
    }
  } catch (error) {
    console.log(error.message);
  }
};

// update user details
const updateUser = async (req, res) => {
  try {
    const name = req.body.name;
    const email = req.body.email;

    // Check for whitespace in any field
    if (/^\s*$/.test(name) || /^\s*$/.test(email)) {
      return res.render("edit-user", {
        message: "Whitespace is not allowed in any field",
        user: { name, email },
      });
    }

    const userData = await User.findByIdAndUpdate(
      { _id: req.body.id },
      { $set: { name, email } }
    );
    res.redirect("/admin/dashboard");
  } catch (error) {
    console.log(error.message);
  }
};

// delete a user
const deleteUser = async (req, res) => {
  try {
    const id = req.query.id;
    const userData = await User.deleteOne({ _id: id });
    res.redirect("/admin/dashboard");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadLogin,
  verifyLogin,
  loadDashboard,
  logout,
  adminDashboard,
  newUserLoad,
  addUser,
  editUser,
  updateUser,
  deleteUser,
};
