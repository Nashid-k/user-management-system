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

// render the registration page
const loadRegister = async (req, res) => {
  try {
    res.render("registration");
  } catch (error) {
    console.log(error.message);
  }
};

//  insert a new user 
const insertUser = async (req, res) => {
  try {
    const { name, email, password, cpassword } = req.body;

    // Check if the email is already registered
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.render("registration", {
        message:
          "Email is already registered. Please use a different email address.",
      });
    }

    // Check if the email ends with "@gmail.com"
    if (!email.endsWith("@gmail.com")) {
      return res.render("registration", {
        message: "Please use a valid Gmail address",
      });
    }

    if (password !== cpassword) {
      return res.render("registration", {
        message: "Password and Confirm Password do not match",
      });
    }

    if (password.length < 6) {
      return res.render("registration", {
        message: "Password must be at least 6 characters long",
      });
    }

    // Check for whitespace in name, email, and password
    if (/\s/.test(name) || /\s/.test(email) || /\s/.test(password)) {
      return res.render("registration", {
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
      res.render("login", {
        message: `Your account is ready. Log in to continue`,
      });
    } else {
      res.render("registration", { message: "Unsuccessful" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// render the login page
const loginLoad = async (req, res) => {
  try {
    res.render("login");
  } catch (error) {
    console.log(error.message);
  }
};

// verify user login 
const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const userData = await User.findOne({ email: email });
    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);

      if (passwordMatch) {
        req.session.user = userData;
        res.redirect("/home");
      } else {
        res.render("login", { message: "Email id or password is incorrect" });
      }
    } else {
      res.render("login", { message: "Email id or password is incorrect" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// render the home page after login
const loadHome = async (req, res) => {
  try {
    const userData = req.session.user;

    if (userData) {
      res.render("home", {
        name: userData.name,
        email: userData.email,
        userData: userData,
      });
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
  }
};

//user logout
const userLogout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
  }
};

//render the edit user profile page
const editProfile = async (req, res) => {
  try {
    const id = req.query.id;
    const userData = await User.findById({ _id: id });
    if (userData) {
      res.render("edit", { user: userData });
    } else {
      res.redirect("/home");
    }
  } catch (error) {
    console.log(error.message);
  }
};

//update user profile details
const updateProfile = async (req, res) => {
  try {
    const userData = await User.findByIdAndUpdate(
      { _id: req.body.user_id },
      { $set: { name: req.body.name, email: req.body.email } }
    );

    res.redirect("/home");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadRegister,
  insertUser,
  loginLoad,
  verifyLogin,
  loadHome,
  userLogout,
  editProfile,
  updateProfile,
};
