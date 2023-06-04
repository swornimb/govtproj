const mongoose = require("mongoose");
mongoose.connect(
  "mongodb+srv://swornim:swornim@cluster0.qclsycd.mongodb.net/?retryWrites=true&w=majority"
);

const userSchema = mongoose.Schema({
  fullname: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  phonenumber: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});
module.exports = mongoose.model("user", userSchema);
