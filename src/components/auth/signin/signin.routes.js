const express = require("express");
const signinRoutes = express.Router();
const signinController = require("./signin.controller");
const { check } = require("express-validator");

signinRoutes.post(
  "/signin",
  [
    check("emailId").trim().isEmail().withMessage("Valid email is required"),
    check("password").notEmpty().withMessage("Password is required"),
  ],
  signinController.signIn
);
signinRoutes.get("/userrole/:id", signinController.userRole);

module.exports = signinRoutes;
