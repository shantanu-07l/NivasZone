const express = require("express");
const router = express.Router();
const Payment = require("../models/payment");
const Booking = require("../models/booking");
const paymentController = require("../controllers/payment");
const {isLoggedIn}=require("../middleware.js");

router.post("/mock-checkout",isLoggedIn, (req, res) => {
  const { amount, bookingId } = req.body;
  res.redirect(`/payments/mock-gateway?bookingId=${bookingId}&amount=${amount}`);
});

router.get("/mock-gateway",isLoggedIn,paymentController.showGateway );

router.post("/mock-success",isLoggedIn, paymentController.paymentSuccess);

router.post("/mock-failure",isLoggedIn,  paymentController.paymentFailure);

module.exports = router;