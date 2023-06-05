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
const JWT_SECRET = 'hgfhd6ej4jhF3'
const nodemailer = require("nodemailer")

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

router.get("/complaint", jwtTokenAuth, async (req, res) => {
  let status = req.query.status;
  if (!status) {
    var all = await Complaint.find({ category: "public" }).sort({
      _id: -1,
    });
  } else {
    var all = await Complaint.find({ category: "public", status: status }).sort(
      {
        _id: -1,
      }
    );
  }

  res.render("citizen/complaint", {
    payload: all,
    userName: req.cookies.user,
    userid: req.cookies.userID,
  });
});

router.get("/details/:id", jwtTokenAuth, async (req, res) => {
  try {
    let all = await Complaint.findById(req.params.id);
    res.render("citizen/detail", {
      payload: all,
      userName: req.cookies.user,
      userid: req.cookies.userID,
    });
  } catch (error) {
    // Handle the exception
    console.error(error);
    res.status(500).send("An error occurred.");
  }
});

router.get("/", async (req, res) => {
  try {
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
    });
  } catch (error) {
    // Handle the exception
    console.error(error);
    res.status(500).send("An error occurred.");
  }
});

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
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred.");
  }
});

router.post("/", jwtTokenAuth, async (req, res) => {
  try {
    let userIdObj = req.cookies.userID;
    const file = req.files && req.files.photo ? req.files.photo : null;
    if (file) {
      var imageResult = await cloudinary.uploader.upload(file.tempFilePath, {
        secure: true,
      });
    }
    console.log(imageResult);
    let complain = new Complaint({
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      username: req.cookies.user,
      images: imageResult?.secure_url || "null",
      userId: userIdObj,
    });
    await complain.save();
    res.redirect("/");
  } catch (error) {
    // Handle the exception
    console.error(error);
    res.status(500).send("An error occurred.");
  }
});

router.get("/login", async (_, res) => {
  res.render("citizen/login", { messege: "" });
});

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

router.get("/signup", async (_, res) => {
  res.render("citizen/signup",{message:""});
});

router.post("/signup", async (req, res) => {

  user.findOne({ email: req.body.email })
  .then(_user => {
      if (_user) {
          res.render("citizen/signup",{message:"User already exists."})
      }
      else {
        bcrypt.hash(req.body.password, 10, function (err, hash) {
          let data = new user({
            fullname: req.body.fullname,
            address: req.body.address,
            phonenumber: req.body.number,
            email: req.body.email,
            password: hash,
          });
          data.save();
        });
        res.redirect("/login");
      }
  })




 
});

router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.clearCookie("user");
  res.redirect("/");
});


router.get("/forget-password", async (req, res) => {
  res.render("forget-password")
})

router.post("/forget-password", async (req, res) => {
  try {
    const { email } = req.body;

    user.findOne({ email: email })
      .then(_user => {
        if (_user) {

          const secret = JWT_SECRET + _user.password
          const payload = {
            email: _user.email,
            id: _user._id

          }
          const token = jwt.sign(payload, secret, { expiresIn: '60m' })
          const link = `http://localhost:5000/reset-password/${_user.id}/${token}`
          console.log(`http://localhost:5000/reset-password/${_user.id}/${token}`)
          var transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
              user: 'prajita.balami@deerwalk.edu.np',
              pass: "ljeibasebfiuhvzp"
            }

          });
          var mailOptions = {
            from: 'prajita.balami@deerwalk.edu.np',
            to: `${email}`,
            subject: 'Reset Password',
            text: `http://localhost:5000/reset-password/${_user.id}/${token}`

          }
          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log(error);
            }
            else {
              console.log("email has been sent", info.response);
            }
          })

          console.log(link)
          res.send("Password reset link has been sent to your email.")


        }
        else {
          res.send({ status: 202, message: "No user found" })

        }
      })


  }
  catch (err) {
    res.send({ status: 201, message: "Something went wrong" })
    console.log(err)
  }
})



router.get("/reset-password/:id/:token", async (req, res) => {
  const { id, token } = req.params

  //check if user exist in db
  user.findOne({ _id: id })
    .then(_user => {
      if (_user) {
        const secret = JWT_SECRET + _user.password
        try {

          const payload = jwt.verify(token, secret)
          res.render('reset-password', { email: _user.email })

        } catch (error) {
          console.log(error.message)
          res.send(error.message)

        }
      }
      else {
        res.send({ status: 202, message: "No user found" })

      }
    })
});

router.post("/reset-password/:id/:token", async (req, res) => {
  const { id, token } = req.params
  const password = req.body.password

  const _user = await user.findOne({ _id: id });
  if (!_user) {
    res.send("No user found")
  }
  const secret = JWT_SECRET + _user.password
  try {
    const verify = jwt.verify(token, secret)
    const encryptedPass = await bcrypt.hash(password, 10)
    await user.updateOne(
      { _id: id },
      {
        $set: {
          password: encryptedPass
        }
      }
    )
    res.send("Updated")
  } catch (error) {
    res.send("Something went wrong")
  }


});

module.exports = router;
