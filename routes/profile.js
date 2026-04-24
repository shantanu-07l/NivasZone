const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profile.js");
const {isLoggedIn}=require("../middleware.js");

//img upload
const multer=require("multer");//handle multipart form-data use for uploading file
const {storage}=require("../cloudConfig.js");
const upload=multer({dest:"uploads/"});


router.get("/", isLoggedIn,(req, res) => {
  res.render("profiles/profile", { user: req.user });
});

router.post("/update",isLoggedIn, upload.single("avtar"), profileController.updateProfile);

module.exports = router;