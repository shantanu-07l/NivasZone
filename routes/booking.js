const express = require("express");
const router = express.Router();
const Listing=require("../models/listing.js");
const Booking=require("../models/booking.js");
const bookingController = require("../controllers/booking");
const {isLoggedIn}=require("../middleware.js");

// Create booking
router.post("/create",isLoggedIn,(req, res, next) => {
  console.log("✅ /bookings/create route reached");
  next();
}, bookingController.createBooking);

// Summary
router.get("/booking-summary/:id",isLoggedIn, bookingController.getBookingSummary);
// Update booking (dates/guests)
router.post("/update/:id",isLoggedIn, bookingController.updateBooking);
// Review page open
router.get("/review/:id", isLoggedIn,bookingController.getReviewPage);
//review for submit 
router.post("/confirm-booking",isLoggedIn, bookingController.confirmBooking);
//show page
router.get('/:id', isLoggedIn,bookingController.showBooking);
//delet booking
router.delete("/:id",isLoggedIn, bookingController.deleteBooking);

module.exports = router;