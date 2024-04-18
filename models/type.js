const mongoose = require("mongoose");
mongoose.connect("mongodb+srv://swornim:mongodb@cluster0.hmhrskc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");

const userSchema = mongoose.Schema({
  type: {
    type: String,
  },
});
module.exports = mongoose.model("type", userSchema);
