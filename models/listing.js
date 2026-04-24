const mongoose=require("mongoose");
const Schema=mongoose.Schema;

const Booking = require("./booking");
const Payment = require("./payment");


const Review=require("./review.js");
const { required } = require("joi");

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    url:String,
    filename:String,
  },
  price: Number,
  location: String,
  country: String,
  reviews:[
    {
      type:Schema.Types.ObjectId,
      ref:"Review"
    }
  ],
  owner:{
    type:Schema.Types.ObjectId,
    ref:"User",

  },
  geometry:{
    type:{
      type:String,
      enum:[`Point`],
      required:true,
    },
    coordinates:{
      type:[Number],
      required:true,
    },
  },
  category:{
        type:String,
        enum:["Trending", "Rooms", "Iconic Cities",
             "Castles", "Amazing Pools", "Farms", 
             "Arctic","Homes","Bed & breakfasts","Boats"],
        required:true,

  },
});

listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {

    console.log("🔥 Listing deleted:", listing._id);

    // 1. Delete reviews
    await Review.deleteMany({
      _id: { $in: listing.reviews }
    });

    // 2. Find bookings of this listing
    const bookings = await Booking.find({ listingId: listing._id });

    // 3. Get booking IDs
    const bookingIds = bookings.map(b => b._id);

    // 4. Delete payments of those bookings
    await Payment.deleteMany({
      bookingId: { $in: bookingIds }
    });

    // 5. Delete bookings
    await Booking.deleteMany({
      listingId: listing._id
    });

    console.log("✅ All related data deleted");
  }
});
const Listing=mongoose.model("Listing",listingSchema);



// listingSchema.post("findOneAndDelete",async(listing) =>{
//   if(listing){
//     await Review.deleteMany({
//       _id: {$in:listing.reviews}});
//   }
// });

module.exports=Listing;