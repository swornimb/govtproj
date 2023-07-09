const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const Complaint = require("../models/complaint");
const user = require("../models/user");
const jwt = require("jsonwebtoken");
const { jwtTokenAuth } = require("../middleware/jwtTokenAuth");
const fileUpload = require("express-fileupload");
const { default: mongoose, get } = require("mongoose");
const cloudinary = require("cloudinary").v2;
const JWT_SECRET = "hgfhd6ej4jhF3";
const nodemailer = require("nodemailer");
const comment = require("../models/comment");
const type = require("../models/type");

router.use(
  fileUpload({
    useTempFiles: true,
  })
);

cloudinary.config({
  cloud_name: "dgggekbbd",
  api_key: "143297277947985",
  api_secret: "4qHP2KnzdsXat3ApEAtdeZYogQM",
  secure: true,
});

// -------------------------------------------GET---------------------------------------------

//all complaint get

router.get("/complaint", jwtTokenAuth, async (req, res) => {
  let complaintType = await type.find();
  let status = req.query.status;
  let area = req.query.area;
  console.log(status + area);
  if (status == "" && area == "") {
    var all = await Complaint.find({ category: "public" }).sort({
      _id: -1,
    });
  } else if (status && area) {
    var all = await Complaint.find({
      category: "public",
      status: status,
      area: area,
    }).sort({
      _id: -1,
    });
  } else if (status && area == "") {
    var all = await Complaint.find({ category: "public", status: status }).sort(
      {
        _id: -1,
      }
    );
  } else if (area && status == "") {
    var all = await Complaint.find({ category: "public", area: area }).sort({
      _id: -1,
    });
  } else {
    var all = await Complaint.find({ category: "public" }).sort({
      _id: -1,
    });
  }

  res.render("citizen/complaint", {
    payload: all,
    userName: req.cookies.user,
    userid: req.cookies.userID,
    area: complaintType,
  });
});

// Complaint detail page

router.get("/details/:id", jwtTokenAuth, async (req, res) => {
  try {
    let allComment = await comment
      .find({ complaintId: req.params.id })
      .populate("userid");
    console.log(allComment);
    let all = await Complaint.findById(req.params.id);
    console.log(allComment);
    res.render("citizen/detail", {
      payload: all,
      isAdmin: req.cookies.admin,
      userName: req.cookies.user || "Admin",
      userid: req.cookies.userID,
      allComment: allComment,
    });
  } catch (error) {
    // Handle the exception
    console.error(error);
    res.status(500).send("An error occurred.");
  }
});
// First page get
router.get("/", async (req, res) => {
  try {
    let allTypes = await type.find();
    let all = await Complaint.find({ category: "public" })
      .sort({ _id: -1 })
      .limit(9);
    let everyData = await Complaint.find().count();
    let successData = await Complaint.find({ status: "Success" }).count();
    let queueData = await Complaint.find({ status: "Queue" }).count();
    let progressData = await Complaint.find({ status: "Progress" }).count();

    res.render("citizen/index", {
      payload: all,
      everyData: everyData,
      userName: req.cookies.user,
      success: successData,
      queue: queueData,
      progress: progressData,
      userid: req.cookies.userID,
      area: allTypes,
    });
  } catch (error) {
    // Handle the exception
    console.error(error);
    res.status(500).send("An error occurred.");
  }
});
// Profile get
router.get("/profile/:id", async (req, res) => {
  try {
    let userIdObj = new mongoose.Types.ObjectId();
    userIdObj = req.params.id;

    let data = await user.findById(req.params.id);
    let allComplaints = await Complaint.find({ userId: userIdObj });
    res.render("citizen/profile", {
      userdata: data,
      allComplaints: allComplaints,
      userName: req.cookies.user,
      userid: req.cookies.userID,
      realuserid: req.params.id,
      isAdmin: req.cookies.admin,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred.");
  }
});

// Login Get

router.get("/login", async (_, res) => {
  res.render("citizen/login", { messege: "" });
});

// Signup Get
router.get("/signup", async (_, res) => {
  res.render("citizen/signup", { message: "" });
});

// Logout Get
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.clearCookie("user");
  res.clearCookie("userID");
  res.redirect("/");
});
// Forgot password get
router.get("/forget-password", async (req, res) => {
  res.render("forget-password");
});

// Password Reset get

router.get("/reset-password/:id/:token", async (req, res) => {
  const { id, token } = req.params;

  //check if user exist in db
  user.findOne({ _id: id }).then((_user) => {
    if (_user) {
      const secret = JWT_SECRET + _user.password;
      try {
        const payload = jwt.verify(token, secret);
        res.render("reset-password", { email: _user.email });
      } catch (error) {
        console.log(error.message);
        res.send(error.message);
      }
    } else {
      res.send({ status: 202, message: "No user found" });
    }
  });
});

// -------------------------------------------POST---------------------------------------------

//Front page post

router.post("/", jwtTokenAuth, async (req, res) => {
  try {
    const { title, description, category, area } = req.body;
    const file =
      req.files && req.files.photo
        ? Array.isArray(req.files.photo)
          ? req.files.photo
          : [req.files.photo]
        : [];

    // Validate input
    if (!title) {
      return res.status(400).send("Title is required");
    }

    if (!description) {
      return res.status(400).send("Description is required");
    }

    if (!category) {
      return res.status(400).send("Category is required");
    }

    if (!file) {
      return res.status(400).send("Photo is required");
    }

    console.log(file);
    let imageResult = [];
    for (const i of file) {
      let x = await cloudinary.uploader.upload(i.tempFilePath, {
        secure: true,
      });
      imageResult.push(x.secure_url);
    }

    const complain = new Complaint({
      title,
      description,
      category,
      username: req.cookies.user,
      images: imageResult.length > 0 ? imageResult : [],
      userId: req.cookies.userID,
      area,
    });

    console.log(complain);
    await complain.save();
    res.redirect("/");
  } catch (error) {
    // Handle the exception
    console.error(error);
    res.status(500).send("An error occurred.");
  }
});

// Login Post
router.post("/login", async (req, res) => {
  try {
    let loginUser = await user.findOne({ email: req.body.email });
    if (loginUser != null) {
      let check = await bcrypt.compare(req.body.password, loginUser.password);
      if (check) {
        if (loginUser.email == "admin@gmail.com") {
          let token = jwt.sign({ user: loginUser._id }, "admin", {
            expiresIn: 3600,
          }); // Env variable for key
          res.cookie("admin", token, {
            httpOnly: true,
          });
          res.cookie("adminID", loginUser._id, {
            httpOnly: true,
          });
          res.redirect("/admin/dashboard");
        } else {
          let token = jwt.sign({ user: loginUser._id }, "shhhhh", {
            expiresIn: 36000,
          }); // Env variable for key
          res.cookie("token", token, {
            httpOnly: true,
          });
          res.cookie("user", loginUser.fullname, {
            httpOnly: true,
          });
          res.cookie("userID", loginUser._id, {
            httpOnly: true,
          });
          res.redirect("/");
        }
      } else {
        res.render("citizen/login", { messege: "Invalid Password" });
      }
    } else {
      res.render("citizen/login", { messege: "Email not found" });
    }
  } catch (error) {
    // Handle the exception
    console.error(error);
    res.status(500).send("An error occurred.");
  }
});

// Signup Post

router.post("/signup", async (req, res) => {
  const { fullname, address, number, email, password } = req.body;

  // Validate input
  if (!fullname || !address || !number || !email || !password) {
    return res.status(400).send("All fields are required");
  }

  if (!/^\d{9}/.test(number)) {
    return res.status(400).send("Phone number must start with 9");
  }

  try {
    const existingUser = await user.findOne({ email });

    if (existingUser) {
      return res.render("citizen/signup", { message: "User already exists." });
    }

    bcrypt.hash(password, 10, function (err, hash) {
      let data = new user({
        fullname,
        address,
        phonenumber: number,
        email,
        password: hash,
      });
      data.save();
    });

    res.redirect("/login");
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred.");
  }
});

// Frogot password Post

router.post("/forget-password", async (req, res) => {
  try {
    const { email } = req.body;

    user.findOne({ email: email }).then((_user) => {
      if (_user) {
        const secret = JWT_SECRET + _user.password;
        const payload = {
          email: _user.email,
          id: _user._id,
        };
        const token = jwt.sign(payload, secret, { expiresIn: "60m" });
        const link = `https://govtproj-production.up.railway.app/reset-password/${_user.id}/${token}`;
        console.log(
          `https://govtproj-production.up.railway.app/reset-password/${_user.id}/${token}`
        );
        var transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 587,
          secure: false,
          requireTLS: true,
          auth: {
            user: "prajita.balami@deerwalk.edu.np",
            pass: "ljeibasebfiuhvzp",
          },
        });
        var mailOptions = {
          from: "prajita.balami@deerwalk.edu.np",
          to: `${email}`,
          subject: "Reset Password",
          text: `https://govtproj-production.up.railway.app//reset-password/${_user.id}/${token}`,
        };
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log("email has been sent", info.response);
          }
        });

        console.log(link);
        res.send("Password reset link has been sent to your email.");
      } else {
        res.send({ status: 202, message: "No user found" });
      }
    });
  } catch (err) {
    res.send({ status: 201, message: "Something went wrong" });
    console.log(err);
  }
});

// Password Reset Post
router.post("/reset-password/:id/:token", async (req, res) => {
  const { id, token } = req.params;
  const password = req.body.password;

  const _user = await user.findOne({ _id: id });
  if (!_user) {
    res.send("No user found");
  }
  const secret = JWT_SECRET + _user.password;
  try {
    const verify = jwt.verify(token, secret);
    const encryptedPass = await bcrypt.hash(password, 10);
    await user.updateOne(
      { _id: id },
      {
        $set: {
          password: encryptedPass,
        },
      }
    );
    res.send("Updated");
  } catch (error) {
    res.send("Something went wrong");
  }
});

router.post("/:complaintid/addcomment", async (req, res) => {
  let complaintId = req.params.complaintid;
  let comm = new comment({
    complaintId: complaintId,
    message: req.body.comment,
    userid: req.cookies.userID,
  });
  await comm.save();
  res.redirect(`/details/${complaintId}`);
});

router.post(
  "/:complaintid/:commentid/:userid/replycomment",
  async (req, res) => {
    let { complaintid, commentid, userid } = req.params;
    let comm = await comment.findByIdAndUpdate(commentid, {
      $push: {
        reply: {
          message: req.body.reply,
          userid: userid,
          username: req.cookies.user,
        },
      },
    });
    await comm.save();
    res.redirect(`/details/${complaintid}`);
  }
);

module.exports = router;
