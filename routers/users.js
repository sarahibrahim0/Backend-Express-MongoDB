const express = require("express");
const { User, userSchema } = require("../models/user");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { json } = require("body-parser");

//create new user

router.post(`/register`, async (req, res) => {
  const salt = await bcrypt.genSalt(10);
  const passwordHash = req.body.password;
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: bcrypt.hashSync(passwordHash, salt),
    phone: req.body.phone,
    street: req.body.street,
    apartment: req.body.apartment,
    city: req.body.city,
    zip: req.body.zip,
    country: req.body.country,
    isAdmin: req.body.isAdmin,
  });

  await user.save();
  if (user) {
    return res.status(200).send(user);
  } else {
    return res.status(404).send("user wasn't created");
  }
});

//get users

router.get(`/`, async (req, res) => {
  const users = await User.find().select("-password");
  if (!users) {
    res.status(401).json("not found");
  }
  res.status(200).send(users);
});

//get user by id
router.get(`/:id`, async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) {
    res.status(401).json("not found");
  }
  res.status(200).send(user);
});

//edit user info

router.put(`/:id`, async (req, res) => {
  const exist = await User.findById(req.params.id);
  console.log(exist);

  let newPassword;

  if (req.body.password) {
    newPassword = bcrypt.hashSync(req.body.password, 10);
    console.log(newPassword);
  } else {
    newPassword = exist.password;
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      email: req.body.email,
      password: newPassword,
      phone: req.body.phone,
      street: req.body.street,
      apartment: req.body.apartment,
      city: req.body.city,
      zip: req.body.zip,
      country: req.body.country,
      isAdmin: req.body.isAdmin,
    },
    {
      new: true,
    }
  );

  if (!user) {
    res.status(400).send("user not found");
  } else {
    res.status(200).send(user);
  }
});

//login api
router.post("/login", async (req, res) => {

  const user = await User.findOne({ email: req.body.email });

  const secret = process.env.secret;

  if (!user) {
    return res.status(400).json({success: false, message:'user is not  found'})
  }

  if (user && bcrypt.compareSync(req.body.password, user.password)) {
    const token = jwt.sign(
      {
        userId: user.id,
        isAdmin: user.isAdmin,
      },
      secret,
      { expiresIn: "1d" }
    );

    res.status(200).send({ user: user.email, token: token });}
  else {
    res.status(402).json({success:false, message:'password is wrong'})
  }
});

//get count of users

router.get(`/get/count`, async (req, res) => {
  const userCount = await User.countDocuments();

  if (!userCount) {
    res.status(500).json({ success: false });
  } else {
    res.send({ userCount: userCount });
  }
});

//delete user

router.delete(`/:id`, (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ success: false, message: "invalid user id" });
  }

  User.findByIdAndRemove(req.params.id)
    .then((user) => {
      if (user) {
        return res.status(200).send(user);
      } else {
        return res
          .status(404)
          .json({ success: false, message: "user not found" });
      }
    })
    .catch((err) => {
      return res.status(500).json({ success: false, message: err });
    });
});

module.exports = router;
