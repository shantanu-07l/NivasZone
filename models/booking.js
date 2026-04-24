
const mongoose=require("mongoose");
const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false},
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  guests: { type: Number, required: true },
  totalPrice: { type: Number, required: true },

     //guest info
  guestName: String,
  guestEmail: String,
  guestPhone: String,
  message: String,

  // payment control
  isPaid: { type: Boolean, default: false },


  status: { 
    type: String, 
    enum: ["pending", "confirmed", "cancelled"], 
    default: "pending" 
  },
  paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment"},
}, { timestamps: true });

const Booking = mongoose.model("Booking", bookingSchema);
module.exports=Booking;