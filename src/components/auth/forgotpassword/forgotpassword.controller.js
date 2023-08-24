const User = require("../../../models/user");
const crypto = require("crypto");
require("dotenv").config();

const AWS = require("aws-sdk");

const lambda = new AWS.Lambda();
const sns = new AWS.SNS();

module.exports = {
  forgotPassword: async (req, res) => {
    try {
      const { emailId } = req.body;
      const url = process.env.url;
      const user = await User.findOne({ emailId });
      if (!user) {
        return res.status(404).json({
          status: 404,
          message: "User not found",
        });
      }
      console.log("user", user);

      const snsMessage = {
        email: user.emailId,
        firstName: user.firstName,
        link: url + user._id,
      };
      
      const topicArn = "arn:aws:sns:ap-south-1:121288770406:test";
      const snsParams = {
        Message: JSON.stringify(snsMessage),
        TopicArn: topicArn,
      };
      
      const subscriptionParams = {
        Protocol: "email",
        TopicArn: topicArn,
        Endpoint: user.emailId,
      };

      
      const subscriptionResponse = await sns
        .subscribe(subscriptionParams)
        .promise();

      console.log("Subscription Response:", subscriptionResponse);
      if (snsParams) {
        const publishResponse = await sns.publish(snsParams).promise();
                
        res
          .cookie("email", emailId, {
            maxAge: 900000,
            httpOnly: true,
            path: "/forgotpassword",
          })
          .status(201)
          .json({
            status: 201,
            message: "Reset password email sent",
          });
      }
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        status: 500,
        message: "Server Error",
      });
    }
  },
  resetPassword: async (req, res) => {
    try {
      const password = req.body.newPassword;
      const confirmpassword = req.body.confirmPassword;
      const salt = process.env.salt;
      const email = req.cookies.email;
      if (!email || !password) {
        return res.status(404).json({
          status: 404,
          message: "Missing email or password",
        });
      }
      const user = await User.findOne({ emailId: email });
      const userId = req.params.userId;

      if (!user) {
        return res.status(400).json({
          status: 400,
          message: "Invalid Email or user",
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          status: 400,
          message: "Password must be at least 6 characters long",
        });
      }
      if (password !== confirmpassword) {
        return res.status(401).json({
          status: 401,
          message: "Password not matched",
        });
      }
      const hashedPassword = crypto
        .pbkdf2Sync(password, salt, 1000, 64, "sha512")
        .toString("hex");
      user.password = hashedPassword;
      await user.save();
      res.clearCookie("email", { path: "/forgotpassword" }).status(201).json({
        status: 201,
        message: "Password updated successfully",
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        status: 500,
        message: "Server Error",
      });
    }
  },
};
