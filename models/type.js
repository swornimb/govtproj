const mongoose = require("mongoose");
mongoose.connect(
  "mongodb+srv://swornim:swornim@cluster0.qclsycd.mongodb.net/?retryWrites=true&w=majority"
);

const userSchema = mongoose.Schema({
  type: {
    type: String,
  },
});
module.exports = mongoose.model("type", userSchema);
