const express = require("express");
const Complaint = require("../models/complaint");
const { jwtTokenAuthAdmin } = require("../middleware/jwtTokenAuthAdmin");
const { ObjectId } = require("mongodb");
const comment = require("../models/comment");
const router = express.Router();

// ------------------------------GET---------------------------------

router.get("/complaint", jwtTokenAuthAdmin, async (req, res) => {
  try {
    let status = req.query.status;
    if (!status) {
      var all = await Complaint.find({ category: "public" }).sort({
        _id: -1,
      });
    } else {
      var all = await Complaint.find({
        category: "public",
        status: status,
      }).sort({
        _id: -1,
      });
    }
    res.render("admin/complaint", { payload: all });
  } catch (error) {
    // Handle the exception
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/details/:id", jwtTokenAuthAdmin, async (req, res) => {
  try {
    let allComment = await comment
      .find({ complaintId: req.params.id })
      .populate("userid");
    let all = await Complaint.findById(req.params.id);
    res.render("admin/detail", {
      payload: all,
      isAdmin: req.cookies.admin,
      userName: "Admin",
      userid: req.cookies.adminID,
      allComment: allComment,
    });
  } catch (error) {
    // Handle the exception
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/dashboard", jwtTokenAuthAdmin, async (req, res) => {
  try {
    let all = await Complaint.find().sort({ _id: -1 }).limit(10);
    let everyData = await Complaint.find().count();
    let successData = await Complaint.find({ status: "Success" }).count();
    let queueData = await Complaint.find({ status: "Queue" }).count();
    let progressData = await Complaint.find({ status: "Progress" }).count();
    res.render("admin/dashboard", {
      payload: all,
      everyData,
      successData,
      queueData,
      progressData,
    });
  } catch (error) {
    // Handle the exception
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/logout", (req, res) => {
  res.clearCookie("admin");
  res.clearCookie("adminID");
  res.redirect("/");
});

// -------------------------POST---------------------------------

router.post("/details/:id", jwtTokenAuthAdmin, async (req, res) => {
  try {
    let all = await Complaint.findByIdAndUpdate(req.params.id, {
      title: req.body.title,
      description: req.body.description,
      statusbar: req.body.progressbar,
      $push: { statusmessege: req.body.progressmessege },
      status: req.body.status,
    });
    all.save();
    console.log(all);
    res.redirect("/admin/dashboard");
  } catch (error) {
    // Handle the exception
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
