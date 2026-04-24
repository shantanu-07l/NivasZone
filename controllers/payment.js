const Payment = require("../models/payment");
const Booking = require("../models/booking");
const Listing = require("../models/listing");
// Show mock gateway
module.exports.showGateway = (req, res) => {
  const { bookingId, amount } = req.query;
  res.render("payments/mock-gateway", { bookingId, amount });
};

// Handle success
module.exports.paymentSuccess = async (req, res) => {

  const { bookingId, upiId, cardNumber, amount } = req.body;
console.log("✅ paymentSuccess route triggered", req.body);

  const payment = await Payment.create({
    bookingId,
    method: upiId ? "upi" : "card",
    upiId,
    cardNumber,
    amount,
    status: "success"
  });


  const booking = await Booking.findByIdAndUpdate(
    bookingId,
    { status: "confirmed", 
      isPaid:true,
      // paymentStatus:"Paid",
      paymentId: payment._id },

    {  returnDocument: "after" }
  ).populate("listingId");
  


  res.render("payments/payment-success", { booking, listing: booking.listingId });
};


// Handle failure
module.exports.paymentFailure = async (req, res) => {
  const { bookingId, upiId, cardNumber, amount } = req.body;

  const payment = await Payment.create({
    bookingId,
    method: upiId ? "upi" : "card",
    upiId,
    cardNumber,
    amount,
    status: "failure"
  });

  const booking = await Booking.findByIdAndUpdate(
    bookingId,
    { status: "cancelled",
       isPaid:false,
      paymentId: payment._id },
    { returnDocument: "after" }
  ).populate("listingId");



  res.render("payments/payment-failure", { bookingId,booking });
};