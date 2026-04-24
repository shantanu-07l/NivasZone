const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
  method: { type: String, enum: ["card", "upi"], required: true },
  upiId: { type: String },
  cardNumber: { type: String },
  amount: { type: Number, required: true },
  status: { type: String, enum: ["success", "failure"], default: "failure" },
  createdAt: { type: Date, default: Date.now }
});


 


module.exports = mongoose.model("Payment", paymentSchema);