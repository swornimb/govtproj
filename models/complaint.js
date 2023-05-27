const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017");

const complaintSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  status: {
    default: "Queue",
    type: String,
    required: true,
  },
  Date: {
    default: new Date(),
    type: String,
    required: true,
  },
  images: {
    type: Array,
  },
});
module.exports = mongoose.model("complaints", complaintSchema);
