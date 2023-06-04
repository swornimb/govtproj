const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const Complaint = require("../models/complaint");
const user = require("../models/user");
const jwt = require("jsonwebtoken");
const { jwtTokenAuth } = require("../middleware/jwtTokenAuth");
const fileUpload = require("express-fileupload");
const { default: mongoose, get } = require("mongoose");
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
  let status = req.query.status;
  if (!status) {
    var all = await Complaint.find({ category: "public" }).sort({
      _id: -1,
    });
  } else {
    var all = await Complaint.find({ category: "public", status: status }).sort(
      {
        _id: -1,
      }
    );
  }

  res.render("citizen/complaint", {
    payload: all,
    userName: req.cookies.user,
    userid: req.cookies.userID,
  });
});

router.get("/details/:id", jwtTokenAuth, async (req, res) => {
  try {
    let all = await Complaint.findById(req.params.id);
    res.render("citizen/detail", {
      payload: all,
      userName: req.cookies.user,
      userid: req.cookies.userID,
    });
  } catch (error) {
    // Handle the exception
    console.error(error);
    res.status(500).send("An error occurred.");
  }
});

router.get("/", async (req, res) => {
  try {
    let all = await Complaint.find({ category: "public" })
      .sort({ _id: -1 })
      .limit(9);
    let everyData = await Complaint.find().count();
    let successData = await Complaint.find({ status: "Success" }).count();
    let queueData = await Complaint.find({ status: "Queue" }).count();
    let progressData = await Complaint.find({ status: "Progress" }).count();

    res.render("citizen/index", {
      payload: all,
      everyData: everyData,
      userName: req.cookies.user,
      success: successData,
      queue: queueData,
      progress: progressData,
      userid: req.cookies.userID,
    });
  } catch (error) {
    // Handle the exception
    console.error(error);
    res.status(500).send("An error occurred.");
  }
});

router.get("/profile/:id", async (req, res) => {
  try {
    let userIdObj = new mongoose.Types.ObjectId();
    userIdObj = req.params.id;
    let data = await user.findById(req.params.id);
    let allComplaints = await Complaint.find({ userId: userIdObj });
    res.render("citizen/profile", {
      userdata: data,
      allComplaints: allComplaints,
      userName: req.cookies.user,
      userid: req.cookies.userID,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred.");
  }
});

router.post("/", jwtTokenAuth, async (req, res) => {
  try {
    let userIdObj = req.cookies.userID;
    if (!(req.files.photo === null)) {
      const file = req.files.photo;
      console.log(file);
      var imageResult = await cloudinary.uploader.upload(file.tempFilePath);
    }

    console.log(imageResult.url);
    let complain = new Complaint({
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      username: req.cookies.user,
      images: imageResult.url,
      userId: userIdObj,
    });
    await complain.save();
    res.redirect("/");
  } catch (error) {
    // Handle the exception
    console.error(error);
    res.status(500).send("An error occurred.");
  }
});

router.get("/login", async (_, res) => {
  res.render("citizen/login", { messege: "" });
});

router.post("/login", async (req, res) => {
  try {
    let loginUser = await user.findOne({ email: req.body.email });
    if (loginUser != null) {
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
          res.cookie("userID", loginUser._id, {
            httpOnly: true,
          });
          res.redirect("/");
        }
      } else {
        res.render("citizen/login", { messege: "Invalid Password" });
      }
    } else {
      res.render("citizen/login", { messege: "Email not found" });
    }
  } catch (error) {
    // Handle the exception
    console.error(error);
    res.status(500).send("An error occurred.");
  }
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

router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.clearCookie("user");
  res.redirect("/");
});

module.exports = router;
