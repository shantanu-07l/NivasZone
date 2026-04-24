const express=require("express");
const router=express.Router();

const wrapAsync = require("../utils/wrapAsync.js");
const {isLoggedIn,isOwner,validateListing}=require("../middleware.js");
const listingController=require("../controllers/listings.js");


//img upload
const multer=require("multer");//handle multipart form-data use for uploading file
const {storage}=require("../cloudConfig.js");
// const upload=multer({dest:"uploads/"});
const upload=multer({storage});



router.route("/")
    .get(wrapAsync(listingController.index))
    .post(isLoggedIn,upload.single("listing[image]"),validateListing,wrapAsync(listingController.createListing));
//search
router.get("/search",listingController.searchListing);

// category filter route
router.get("/category/:cat", wrapAsync(listingController.filterByCategory));


router.get("/new", isLoggedIn,listingController.renderNewForm);

router.route("/:id")
    .get(wrapAsync(listingController.showListings))
    .put(isLoggedIn,isOwner,upload.single("listing[image]"),validateListing,wrapAsync(listingController.updateListing))
    .delete(isLoggedIn,isOwner,wrapAsync(listingController.destroyListing));


//Edit Route
router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(listingController.renderEditForm));


module.exports=router;




