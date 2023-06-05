const mongoose = require("mongoose");
mongoose.connect(
  "mongodb+srv://swornim:swornim@cluster0.qclsycd.mongodb.net/?retryWrites=true&w=majority"
);

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
  username: {
    type: String,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref : 'user',
    required: true,
  },
});
module.exports = mongoose.model("complaints", complaintSchema);
