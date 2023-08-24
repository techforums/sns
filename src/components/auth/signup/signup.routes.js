const express = require('express')
const signupRoutes = express.Router()
const signupController = require('./signup.controller')
const { check } = require("express-validator");

signupRoutes.post(
    '/signup',
    signupController.signUp
  );

module.exports = signupRoutes