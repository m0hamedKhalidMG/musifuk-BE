const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const mongoose = require("mongoose");

const Admin = mongoose.model("Admin");
const Driver = mongoose.model("Driver");

require("dotenv").config({ path: ".env" });

exports.register = async (req, res) => {
  try {
    let { email, password, passwordCheck, name, surname } = req.body;

    if (!email || !password || !passwordCheck)
      return res.status(400).json({ msg: "Not all fields have been entered." });
    if (password.length < 5)
      return res
        .status(400)
        .json({ msg: "The password needs to be at least 5 characters long." });
    if (password !== passwordCheck)
      return res
        .status(400)
        .json({ msg: "Enter the same password twice for verification." });

    const existingAdmin = await Admin.findOne({ email: email });
    if (existingAdmin)
      return res
        .status(400)
        .json({ msg: "An account with this email already exists." });

    if (!name) name = email;

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    const newAdmin = new Admin({
      email,
      password: passwordHash,
      name,
      surname,
    });
    const savedAdmin = await newAdmin.save();
    res.status(200).send({
      success: true,
      admin: {
        id: savedAdmin._id,
        name: savedAdmin.name,
        surname: savedAdmin.surname,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      result: null,
      message: err.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Validate input
    if (!email || !password || !role)
      return res.status(400).json({ msg: "Not all fields have been entered." });

    // Check user type based on role
    const User = role === "Driver" ? Driver : Admin;

    // Find user by email
    const user = await User.findOne({ email });

    // Return error if user not found
    if (!user)
      return res.status(400).json({
        success: false,
        result: null,
        message: "No account with this email has been registered.",
      });

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({
        success: false,
        result: null,
        message: "Invalid credentials.",
      });

    // Generate JWT token
    const token = jwt.sign(
      {
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
        id: user._id,
        role: role,
      },
      process.env.JWT_SECRET
    );

    // Update user's login status
    const result = await User.findByIdAndUpdate(
      { _id: user._id },
      { isLoggedIn: true },
      { new: true }
    ).exec();

    // Prepare response based on user role
    const response = {
      success: true,
      result: {
        token,
        role: role,
        admin: {
          id: result._id,
          name: result.name,
          isLoggedIn: result.isLoggedIn,
        },
      },
      message: `Successfully login ${role.toLowerCase()}`,
    };

    res.json(response);
  } catch (err) {
    res
      .status(500)
      .json({ success: false, result: null, message: err.message });
  }
};

exports.isValidToken = async (req, res, next) => {
  try {
    const token = req.header("x-auth-token");
    if (!token)
      return res.status(401).json({
        success: false,
        result: null,
        message: "No authentication token, authorization denied.",
        jwtExpired: true,
      });

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (!verified)
      return res.status(401).json({
        success: false,
        result: null,
        message: "Token verification failed, authorization denied.",
        jwtExpired: true,
      });

    let user = null;
    if (verified.role === "Admin") {
      req.role = "Admin";
      user = await Admin.findOne({ _id: verified.id });
      if (!user)
        return res.status(401).json({
          success: false,
          result: null,
          message: "Admin doesn't exist, authorization denied.",
          jwtExpired: true,
        });
    } else if (verified.role === "Driver") {
      user = await Driver.findOne({ _id: verified.id });
      if (!user)
        return res.status(401).json({
          success: false,
          result: null,
          message: "Driver doesn't exist, authorization denied.",
          jwtExpired: true,
        });
    } else {
      return res.status(401).json({
        success: false,
        result: null,
        message: "Invalid role, authorization denied.",
        jwtExpired: true,
      });
    }

    if (user.isLoggedIn === false)
      return res.status(401).json({
        success: false,
        result: null,
        message: `${verified.role} is already logged out, try to login again, authorization denied.`,
        jwtExpired: true,
      });

    req.user = user; // Attach the user to the request object
    next();
  } catch (err) {
    res.status(500).json({
      success: false,
      result: null,
      message: err.message,
      jwtExpired: true,
    });
  }
};
exports.logout = async (req, res) => {
  const result = await Admin.findOneAndUpdate(
    { _id: req.admin._id },
    { isLoggedIn: false },
    {
      new: true,
    }
  ).exec();

  res.status(200).json({ isLoggedIn: result.isLoggedIn });
};
exports.isDriver = (req, res, next) => {
  if (req.user.role !== "Driver") {
    return res.status(403).json({
      success: false,
      result: null,
      message: "Access denied. Only drivers are allowed to access this route.",
    });
  }
  next();
};
exports.IsAdmin = (req, res, next) => {
  if (req.role !== "Admin") {
    return res.status(403).json({
      success: false,
      result: null,
      message: "Access denied. Only Admin are allowed to access this route.",
    });
  }
  next();
};
