const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const Complaint = require("../models/complaint");
const user = require("../models/user");
const jwt = require("jsonwebtoken");
const { jwtTokenAuth } = require("../middleware/jwtTokenAuth");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;

router.use(
  fileUpload({
    useTempFiles: true,
  })
);

cloudinary.config({
  cloud_name: "dgggekbbd",
  api_key: "143297277947985",
  api_secret: "4qHP2KnzdsXat3ApEAtdeZYogQM",
});

router.get("/complaint", jwtTokenAuth, async (req, res) => {
  let all = await Complaint.find({ category: "public" }).sort({ _id: -1 });
  res.render("citizen/complaint", { payload: all, userName: req.cookies.user });
});

router.get("/details/:id", jwtTokenAuth, async (req, res) => {
  let all = await Complaint.findById(req.params.id);
  res.render("citizen/detail", { payload: all, userName: req.cookies.user });
});

router.get("/", async (req, res) => {
  let all = await Complaint.find({ category: "public" })
    .sort({ _id: -1 })
    .limit(9);
  res.render("citizen/index", { payload: all, userName: req.cookies.user });
});

router.post("/", jwtTokenAuth, async (req, res) => {
  const file = req.files.photo;
  console.log(file);
  let imageResult = await cloudinary.uploader.upload(file.tempFilePath);
  console.log(imageResult.url);
  let complain = await new Complaint({
    title: req.body.title,
    description: req.body.description,
    category: req.body.category,
    username: req.cookies.user,
    images: imageResult.url,
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
      res.cookie("user", loginUser.fullname, {
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
