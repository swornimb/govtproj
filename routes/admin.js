const express = require("express");
const Complaint = require("../models/complaint");
const {jwtTokenAuthAdmin} = require("../middleware/jwtTokenAuthAdmin");
const { ObjectId } = require("mongodb");
const router = express.Router();

router.get("/complaint",jwtTokenAuthAdmin, async (req, res) => {
  let all = await Complaint.find().sort({ _id: -1 });
  res.render("admin/complaint", { payload: all });
});

router.get("/details/:id",jwtTokenAuthAdmin, async (req, res) => {
  let all = await Complaint.findById(req.params.id);
  res.render("admin/detail", { payload: all, put: true });
});

router.post("/details/:id",jwtTokenAuthAdmin, async (req, res) => {
  let all = await Complaint.findByIdAndUpdate(req.params.id, {
    status: req.body.status,
  });
  all.save();
  console.log(all);
  res.send("admin/detail");
});

router.get("/dashboard",jwtTokenAuthAdmin, async (req, res) => {
  let all = await Complaint.find().sort({ _id: -1 }).limit(10);
  res.render("admin/dashboard", { payload: all });
});

module.exports = router;
