const express = require("express");
const Complaint = require("../models/complaint");
const { jwtTokenAuthAdmin } = require("../middleware/jwtTokenAuthAdmin");
const { ObjectId } = require("mongodb");
const router = express.Router();

router.get("/complaint", jwtTokenAuthAdmin, async (req, res) => {
  try {
    let all = await Complaint.find().sort({ _id: -1 });
    res.render("admin/complaint", { payload: all });
  } catch (error) {
    // Handle the exception
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/details/:id", jwtTokenAuthAdmin, async (req, res) => {
  try {
    let all = await Complaint.findById(req.params.id);
    console.log(all);
    res.render("admin/detail", { payload: all, put: true });
  } catch (error) {
    // Handle the exception
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/details/:id", jwtTokenAuthAdmin, async (req, res) => {
  try {
    let all = await Complaint.findByIdAndUpdate(req.params.id, {
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

router.get("/dashboard", jwtTokenAuthAdmin, async (req, res) => {
  try {
    let all = await Complaint.find().sort({ _id: -1 }).limit(10);
    res.render("admin/dashboard", { payload: all });
  } catch (error) {
    // Handle the exception
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/logout", (req, res) => {
  res.clearCookie("admin");
  res.redirect("/");
});

module.exports = router;
