const mongoose = require("mongoose");
const type = require("./type");

mongoose.connect(
    "mongodb+srv://swornim:mongodb@cluster0.hmhrskc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
  );
const otpSchema = mongoose.Schema({
    number: {
        type: String,
        required: true
    },
    otp:{
        type: String,
        required: true
    },
    createdAt: { 
        type: Date,  
        default: Date.now 
    },
},{timestamps: true})

otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 10 });

const Otp = mongoose.model("Otp", otpSchema);

module.exports = Otp;



