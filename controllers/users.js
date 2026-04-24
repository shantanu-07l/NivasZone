const User=require("../models/user.js");
const Booking = require("../models/booking");
const { generateOTP } = require("../utils/otp");
const { sendOTP } = require("../utils/sendEmail");
const bcrypt = require("bcrypt");

module.exports.rendersignupForm=(req,res) => {
    res.render("users/signup.ejs");
};

module.exports.signup=async(req,res) => {
    try{
        let { username, email, password } = req.body;
        // ✅ CHECK USERNAME
        let existingUsername = await User.findOne({ username });
        if (existingUsername) {
            req.flash("error", "Username already exists ❌");
            return res.redirect("/signup");
        }

        // ✅ CHECK EMAIL
        let existingEmail = await User.findOne({ email });
        if (existingEmail) {
            req.flash("error", "Email already registered ❌");
            return res.redirect("/signup");
        }
        const otp = generateOTP();
        const hashedOtp = await bcrypt.hash(otp, 10);

        req.session.tempUser = { username, email, password };
        req.session.otp = hashedOtp;
        req.session.otpExpiry = Date.now() + 60 * 1000;

        await sendOTP(email, otp);

        res.render("users/verify-otp.ejs", { email });
        // let{username,email,password}=req.body;
        // const newUser=new User({email,username});
        // const registeredUser=await User.register(newUser,password);
        // console.log(registeredUser);
        // req.login(registeredUser,(err) =>{
        //     if(err){
        //         return next(err);
        //     }
        //     req.flash("success","Welcome to Wanderlust !");
        //     res.redirect("/listings");
        // });
    }catch(e){
        req.flash("error",e.message);
        res.redirect("/signup");
    }
};
module.exports.resendOTP = async (req, res) => {
    try {
        const email = req.session.tempUser.email;
        // ✅ PREVENT SPAM (30 sec cooldown) for server side vailidate
        if (req.session.lastResend && Date.now() - req.session.lastResend < 60000) {
            req.flash("error", "Wait 30 seconds before resending OTP ⏳");
            return res.redirect(`/verify-otp?email=${email}`);
        }

        req.session.lastResend = Date.now();

        // generate new OTP
        const otp = generateOTP();
        const hashedOtp = await bcrypt.hash(otp, 10);

        // store in session
        req.session.otp = hashedOtp;
        req.session.otpExpiry = Date.now() +60 * 1000;

        // send email
        await sendOTP(email, otp);

        req.flash("success", "New OTP sent ✅");

        res.redirect(`/verify-otp?email=${email}`);

    } catch (err) {
        req.flash("error", "Failed to resend OTP ❌");
        res.redirect("/signup");
    }
};
module.exports.verifyOTP = async (req, res, next) => {
    const { otp } = req.body;

    // ✅ check session exists
    if (!req.session.otp || !req.session.otpExpiry) {
        req.flash("error", "Session expired. Try again.");
        return res.redirect("/signup");
    }

    // ✅ check expiry
    if (req.session.otpExpiry < Date.now()) {
        req.flash("error", "OTP expired ❌");
        return res.redirect("/signup");
    }
    // ✅ LIMIT ATTEMPTS
    if (!req.session.attempts) req.session.attempts = 0;

    req.session.attempts++;

    if (req.session.attempts > 3) {
        req.flash("error", "Too many wrong attempts ❌");
        return res.redirect("/signup");
    }

    const isMatch = await bcrypt.compare(otp, req.session.otp);

    if (!isMatch) {
        req.flash("error", "Wrong OTP ❌");
        return res.redirect(`/verify-otp?email=${req.session.tempUser.email}`);
    }

    // ✅ create user
    const { username, email, password } = req.session.tempUser;

    const newUser = new User({ username, email });
    const registeredUser = await User.register(newUser, password);
    // ✅ clear session
    req.session.otp = null;
    req.session.otpExpiry = null;
    req.session.tempUser = null;
    req.session.attempts = 0;

    req.login(registeredUser, (err) => {
        if (err) return next(err);
        req.flash("success", "Signup successful 🎉");
        res.redirect("/listings");
    });
};

// module.exports.forgetPassword= async (req,res)=> {
//      try {
//         const { email } = req.body;
//         // ✅ PREVENT SPAM (30 sec cooldown) for server side vailidate
//         if (req.session.lastResend && Date.now() - req.session.lastResend < 60000) {
//             req.flash("error", "Wait 30 seconds before resending OTP ⏳");
//             return res.redirect(`/verify-otp?email=${email}`);
//         }

//         req.session.lastResend = Date.now();

//         // generate new OTP
//         const otp = generateOTP();
//         const hashedOtp = await bcrypt.hash(otp, 10);

//         // store in session
//         req.session.otp = hashedOtp;
//         req.session.otpExpiry = Date.now() +60 * 1000;

//         // send email
//         await sendOTP(email, otp);

//         req.flash("success", "New OTP sent ✅");

//         res.redirect(`/verify-otp?email=${email}`);

//     } catch (err) {
//         req.flash("error", "Failed to resend OTP ❌");
//         res.redirect("/forget-password");
//     }

// };


module.exports.renderLoginForm=(req,res) =>{
    res.render("users/login.ejs");
};

module.exports.login=async(req,res) =>{
        req.flash("success","Welcome back to Wanderlist !");
        let redirectUrl=res.locals.redirectUrl || "/listings";
        console.log(req.user);
        res.redirect(redirectUrl);
        
};

module.exports.logout=(req,res,next) =>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","You are Logged Out !");
        res.redirect("/listings");
    });
};

//dashboard
module.exports.showDashboard=async(req,res)=>{
     console.log("👉 DASHBOARD CONTROLLER RUNNING");
     if(!req.user){
    req.flash("error","Please login first");
    return res.redirect("/login");
  }
  try{
   const bookings = await Booking
        .find({ userId: req.user._id })
        .populate("listingId")
        .sort({createdAt:-1});

  res.render("users/dashboard", { 
      user: req.user, 
      bookings 
  });
}
catch(err){
    console.error(err);
    res.send("Something went wrong");
}
};

// render profile
module.exports.renderProfile = (req,res)=>{
    res.render("profiles/profile",{ user:req.user });
};

//update profile 
module.exports.updateProfile = async (req,res)=>{
  try{
    const { username, email } = req.body;

    if(!username || !email){
        req.flash("error","Name and Email are required");
        return res.redirect("/profile");
    }

    const existingUser = await User.findOne({ email });
    if(existingUser && existingUser._id.toString() !== req.user._id.toString()){
        req.flash("error","Email already in use");
        return res.redirect("/profile");
    }

    const updateData = { username, email };

    // ⭐ Avatar upload check
    if(req.file){
         console.log("FILE 👉", req.file); 
        updateData.avatar = {
            url: req.file.path,
            filename: req.file.filename
        };
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        updateData,
        { new:true }
    );

    // session refresh
    req.login(updatedUser,(err)=>{
        if(err){
            req.flash("error","Session update error");
            return res.redirect("/profile");
        }

        req.flash("success","Profile updated successfully!");
        res.redirect("/profile");
    });

  }catch(err){
    console.log(err);
    req.flash("error","Something went wrong");
    res.redirect("/profile");
  }
};

module.exports.renderRecent = async (req, res) => {
  try {
    // userId field use karo, kyunki schema me userId hai (na ki user)
    const latestBooking = await Booking.findOne({ userId: req.user._id })
      .populate("listingId") // listing details fetch karne ke liye
      .sort({ createdAt: -1 });

    res.render("bookings/recent", { booking: latestBooking });
  } catch (err) {
    console.error("Error fetching recent booking:", err);
    res.status(500).send("Server Error");
  }
};
