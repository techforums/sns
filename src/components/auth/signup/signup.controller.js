const User = require("../../../models/user");
const crypto = require("crypto");
require("dotenv").config();
const { validationResult } = require("express-validator");

module.exports = {
  signUp: async (req, res) => {
    

    

      const { firstName, lastName, emailId, password } = req.body;
      const existingUser = await User.findOne({ emailId });
      if (existingUser) {
        return res.status(400).json({
          status: 400,
          message: "Email already exists",
        });
      }

      const salt = process.env.salt;
      const hashedPassword = crypto
        .pbkdf2Sync(password, salt, 1000, 64, "sha512")
        .toString("hex");

      const user = new User({
        firstName,
        lastName,
        emailId,
        password: hashedPassword,
        userRole: process.env.userRole,
      });

      await user.save();

      res.status(201).json({
        status: 201,
        message: "User created successfully",
        data: emailId,
      });
    }, catch (err) {
      console.error(err);
      return res.status(500).json({
        status: 500,
        message: "Server Error",
        error: err.message,
      });
    }
  }

