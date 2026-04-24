const express=require("express");
const router=express.Router();

const wrapAsync = require("../utils/wrapAsync.js");
const passport=require("passport");
const {saveRedirectUrl,isLoggedIn,upload}=require("../middleware.js");

const userController=require("../controllers/users.js");

router.route("/signup")
    .get(userController.rendersignupForm)
    .post(wrapAsync(userController.signup));

router.post("/verify-otp", wrapAsync(userController.verifyOTP));
router.post("/resend-otp", userController.resendOTP);

router.get("/verify-otp", (req, res) => {
    const { email } = req.query;
    res.render("users/verify-otp.ejs", { email });
});
// router.get("/forget-password",(req,res)=>{
//     res.render("users/forget-password.ejs");
// });
// router.post("/forget-password",wrapAsync(userController.forgetPassword));

router.route("/login")
    .get(userController.renderLoginForm)
    .post(saveRedirectUrl,passport.authenticate("local",
    { failureRedirect:"/login",
    failureFlash:true,}),userController.login);

router.get("/logout",userController.logout);

router.get("/dashboard",isLoggedIn,
    (req,res,next)=>{
    console.log("👉 DASHBOARD ROUTE HIT");
    next();
},userController.showDashboard);


// profile page
router.get("/profile", isLoggedIn, userController.renderProfile);

// update profile
router.post("/profile", 
isLoggedIn,
 upload.single("avatar"), 
 wrapAsync(userController.updateProfile));

router.get("/recent",userController.renderRecent);

module.exports=router;