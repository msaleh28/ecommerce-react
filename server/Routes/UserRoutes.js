import express from "express";
import nodemailer from "nodemailer";
import google from "googleapis";
import dotenv from "dotenv";
import {uuid, isUuid} from "uuidv4";
import bcrypt from "bcrypt";
import asyncHandler from "express-async-handler";
import { protect, admin } from "../Middleware/AuthMiddleware.js";
import generateToken from "../utils/generateToken.js";
import User from "./../Models/UserModel.js";
import UserVerification from "./../Models/UserVerification.js";

const userRouter = express.Router();
dotenv.config();

// nodemailer

const oAuth2Client = new google.google.auth.OAuth2(
  process.env.AUTH_CLIENT_ID,
  process.env.AUTH_CLIENT_SECRET,
  'https://developers.google.com/oauthplayground'
);

oAuth2Client.setCredentials({
  access_token: process.env.AUTH_ACCESS_TOKEN,
  refresh_token: process.env.AUTH_REFRESH_TOKEN,
});

let transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  auth: {
    type: "OAuth2",
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASS,
    clientId: process.env.AUTH_CLIENT_ID,
    clientSecret: process.env.AUTH_CLIENT_SECRET,
    refreshToken: process.env.AUTH_REFRESH_TOKEN,
    accessToken: oAuth2Client.getAccessToken(),
  },
  tls: {
    rejectUnauthorized: false
  },
})

//testing success
transporter.verify((error, success) => {
  if(error) {
    console.log("nodemailer error");
    console.log(error);
  } else {
    console.log("ready for messages");
    console.log(success);
  }
})

// send verification email

const sendVerificationEmail = (_id, email, res) => {
  // url to be used in email
  console.log("inside send verification");
  const currentUrl = "http://localhost:5000/";

  const uniqueString = uuid() + _id;
  console.log("created uuid");

  const mailOptions = {
    from: process.env.AUTH_EMAIL,
    to: email,
    subject: "Verify your Email",
    html: `<p>Verify your email address to complete your registration</p><p>This link <b>expires in 6 hours.</b></p>
          <p>Press <a href=${currentUrl + "user/verify/" + _id + "/" + uniqueString}> here</a> to proceed.</p>`
  }

  // hash uniqueString
  const saltRounds = 10;
  bcrypt
  .hash(uniqueString, saltRounds)
  .then((hashedUniqueString) => {
    // set values in userVerification
    const newVerification = new UserVerification({
      userId: _id,
      uniqueString: hashedUniqueString,
      createdAt: Date.now(),
      expiresAt: Date.now() + 21600000,
    });
    console.log("after bcrypt hash");
    console.log(`passed in _id: ${_id}, passed in email: ${email}`);
    console.log(`userId: ${newVerification.userId}`);

    newVerification
      .save()
      .then(() => {
        transporter
        .sendMail(mailOptions)
        .then(() => {
          // email sent and verification record saved
          console.log("pending verification");
          // res.json({
          //   status: "PENDING",
          //   message: "Verification email sent",
          // });
          
        })
        .catch((error) => {
          console.log(error);
          res.json({
            status: "FAILED",
            message: "Verification email failed",
        });
        })
      })
      .catch((error) => {
        console.log(error);
        res.json({
          status: "FAILED",
          message: "Couldn't save verification",
        });
      })
  })
  .catch(() => {
    console.log("error while hashing");
    res.json({
      status: "FAILED",
      message: "An error occured while hashing email data!",
    });
    console.log("successfully sent");
  })

};

// LOGIN
userRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password)) && user.verified) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
        createdAt: user.createdAt,
      });
    } else if (user && (await user.matchPassword(password)) && !user.verified) {
      res.status(400);
      throw new Error("Email not verified");
    } else {
      res.status(401);
      throw new Error("Invalid Email or Password");
    }
  })
);

// REGISTER
userRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    console.log("check if user exists");
    if (userExists) {
      res.status(400);
      throw new Error("User already exists");
    }

    console.log("before created user");
    const user = await User.create({
      name,
      email,
      password,
      verified: false,
    });
    console.log("after created user");

    if (user) {
      // res.status(201).json({
      //   _id: user._id,
      //   name: user.name,
      //   email: user.email,
      //   isAdmin: user.isAdmin,
      //   token: generateToken(user._id),
      // });
      console.log("before send verification");
      const id = user._id;
      console.log(`before func call, id: ${id}, email: ${email}`);
      sendVerificationEmail(id, email, res);
      console.log("verification sent!! ");
      // res.status(400);
      // throw new Error(`Verification email sent to ${email}.`)
    } else {
      res.status(400);
      throw new Error("Invalid User Data");
    }
  })
);

// PROFILE
userRouter.get(
  "/profile",
  protect,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
      });
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  })
);

// UPDATE PROFILE
userRouter.put(
  "/profile",
  protect,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      if (req.body.password) {
        user.password = req.body.password;
      }
      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        createdAt: updatedUser.createdAt,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  })
);

// GET ALL USER ADMIN
userRouter.get(
  "/",
  protect,
  admin,
  asyncHandler(async (req, res) => {
    const users = await User.find({});
    res.json(users);
  })
);

export default userRouter;
