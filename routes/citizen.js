const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const Complaint = require("../models/complaint");
const user = require("../models/user");
const jwt = require("jsonwebtoken");
const { jwtTokenAuth } = require("../middleware/jwtTokenAuth");

router.get("/complaint", jwtTokenAuth, async (_, res) => {
  let all = await Complaint.find().sort({ _id: -1 });
  res.render("citizen/complaint", { payload: all });
});

router.get("/details/:id", jwtTokenAuth, async (req, res) => {
  let all = await Complaint.findById(req.params.id);
  res.render("citizen/detail", { payload: all });
});

router.get("/", async (_, res) => {
  let all = await Complaint.find().sort({ _id: -1 }).limit(9);
  res.render("citizen/index", { payload: all });
});

router.post("/", jwtTokenAuth, async (req, res) => {
  let complain = await new Complaint({
    title: req.body.title,
    description: req.body.description,
    category: req.body.category,
  });
  await complain.save();
  res.redirect("/");
});

router.get("/login", async (_, res) => {
  res.render("citizen/login");
});

router.post("/login", async (req, res) => {
  let loginUser = await user.findOne({ email: req.body.email });
  let check = await bcrypt.compare(req.body.password, loginUser.password);
  if (check) {
    if (loginUser.email == "admin@gmail.com") {
      let token = jwt.sign({ user: loginUser._id }, "admin", {
        expiresIn: 60,
      }); // Env variable for key
      res.cookie("admin", token, {
        httpOnly: true,
      });
      res.redirect("/admin/dashboard");
    } else {
      let token = jwt.sign({ user: loginUser._id }, "shhhhh", {
        expiresIn: 60,
      }); // Env variable for key
      res.cookie("token", token, {
        httpOnly: true,
      });
      res.redirect("/");
    }
  }
  res.render("citizen/login");
});

router.get("/signup", async (_, res) => {
  res.render("citizen/signup");
});

router.post("/signup", async (req, res) => {
  bcrypt.hash(req.body.password, 10, function (err, hash) {
    let data = new user({
      fullname: req.body.fullname,
      address: req.body.address,
      phonenumber: req.body.number,
      email: req.body.email,
      password: hash,
    });
    data.save();
  });
  res.redirect("/login");
});

module.exports = router;
