const mongoose = require("mongoose");
mongoose.connect(
  "mongodb+srv://swornim:swornim@cluster0.qclsycd.mongodb.net/?retryWrites=true&w=majority"
);

const userSchema = mongoose.Schema({
    message: {
        type: String,
    },
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "comment",
        required: false,
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    },
    complaintId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "complaints",
    },
    Date: {
        default: new Date(),
        type: String,
        required: true,
      },
});
module.exports = mongoose.model("comment", userSchema);
