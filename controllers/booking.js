const Listing = require("../models/listing");
const Booking = require("../models/booking");
const Payment = require("../models/payment");

// Create Booking
module.exports.createBooking = async (req, res) => {
    if (!req.user) {
      req.flash("error", "Please login first");
      return res.redirect("/login");
    }
  console.log("✅ createBooking controller running");

  const { listingId, checkIn, checkOut, guests ,guestName,guestEmail,guestPhone,message} = req.body;

  if (new Date(checkOut) <= new Date(checkIn)) {
    req.flash("error", "Invalid dates");
    return res.redirect("/listings");
  }
  const listing = await Listing.findById(listingId);
  const nights = (new Date(checkOut) - new Date(checkIn)) / (1000*60*60*24);
  const totalPrice = nights * listing.price;

  const booking = new Booking({
    listingId,
    checkIn,
    checkOut,
    guests,
    totalPrice,
    guestName,
    guestEmail,
    guestPhone,
    message
  });
  if (!req.user) {
  req.session.redirectUrl = `/bookings/booking-summary/${booking._id}`;
  }

 
  // Agar user login hai to hi assign karo
    if (req.user) {
        booking.userId = req.user._id;
    }

   try {
    await booking.save();
    console.log("✅ Booking saved:", booking);
    console.log("✅ booking._id:", booking._id);
  } catch (err) {
    console.error("Booking save error:", err);
  }

 console.log("Redirecting to:", `/bookings/booking-summary/${booking._id}`);
  res.redirect(`/bookings/booking-summary/${booking._id}`);
};


// Booking Summary
module.exports.getBookingSummary = async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate("listingId");

  if (!booking) return res.send("Booking not found");

  const listing = booking.listingId;

  const nights = (new Date(booking.checkOut) - new Date(booking.checkIn)) / (1000*60*60*24);
  const subtotal = nights * listing.price;
  const taxes = subtotal * 0.053;
  const total = subtotal + taxes;
  res.render("listings/booking-summary", {
    booking,
    listing,
    checkIn: new Date(booking.checkIn).toDateString(),
    checkOut: new Date(booking.checkOut).toDateString(),
    guests: booking.guests,
    nights,
    pricePerNight: listing.price,
    subtotal,
    taxes,
    total
  });
};

module.exports.updateBooking = async (req, res) => {
  const { id } = req.params;
  const { checkIn, checkOut, guests } = req.body;

  if (new Date(checkOut) <= new Date(checkIn)) {
    req.flash("error", "Invalid dates");
    return res.redirect("/listings");
  }

  const booking = await Booking.findById(id).populate("listingId");
  if (!booking) return res.send("Booking not found");

  // Update booking fields
  booking.checkIn = new Date(checkIn);
  booking.checkOut = new Date(checkOut);
  booking.guests = guests;

  // Recalculate totals
  const nights = (booking.checkOut - booking.checkIn) / (1000*60*60*24);
  const subtotal = nights * booking.listingId.price;
  const taxes = subtotal * 0.053;
  const total = subtotal + taxes;

  booking.totalPrice = total;
  await booking.save();
  res.redirect(`/bookings/booking-summary/${booking._id}`)
};

module.exports.getReviewPage = async (req, res) => {
  const { id } = req.params;
  const booking = await Booking.findById(id).populate("listingId");

  if (!booking) {
    return res.send("Booking not found");
  }

  // nights calculation
  const diffTime = Math.abs(booking.checkOut - booking.checkIn);
  const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const pricePerNight = booking.listingId.price;
  const subtotal = nights * pricePerNight;
  const serviceFee = 3500;
  const total = subtotal + serviceFee;

  res.render("bookings/review", {
    booking,
    nights,
    subtotal,
    total,
    serviceFee
  });
};

 
module.exports.confirmBooking = async (req,res)=>{
  try{
     const { bookingId, guestName, guestEmail, guestPhone, message } = req.body;
    //  const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId);
    if(!booking) return res.send("Booking not found");

    //  save guest info
     booking.guestName = guestName;
    booking.guestEmail = guestEmail;
    booking.guestPhone = guestPhone;
      booking.message = message;

    // STILL NOT PAID
    booking.status = "pending";

    await booking.save();

    //  redirect to summary page
    res.redirect(`/bookings/booking-summary/${bookingId}?payment=pending`);

  }catch(err){
    console.log(err);
    res.send("Error saving booking");
  }
};

//show booking details
module.exports.showBooking=async (req, res) => {
   try {
    const booking = await Booking.findById(req.params.id)
      .populate('listingId')
      .populate('userId')
      .populate('paymentId');

    if (!booking) {
      return res.status(404).send("Booking not found");
    }

    res.render('bookings/show', { booking });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }

};

module.exports.deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);

    if (!booking.userId.equals(req.user._id)) {
      req.flash("error", "Not authorized");
      return res.redirect("/dashboard");
    }

    console.log("🔥 Deleting booking:", id);

    // 1. Delete payment
    await Payment.deleteMany({ bookingId: id });

    // 2. Delete booking
    await Booking.findOneAndDelete({ _id: id });

    console.log("✅ Booking & payment deleted");

    res.redirect("/dashboard");

  } catch (err) {
    console.error(err);
    res.send("Error deleting booking");
  }
};



// module.exports.deleteBooking = async (req, res) => {
//   try {
//     const { id } = req.params;
//     await Booking.findByIdAndDelete(id);
//     res.redirect("/dashboard");
//   } catch (err) {
//     console.error("Error deleting booking:", err);
//     res.status(500).send("Failed to delete booking");
//   }
// };