// Load environment variables
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: "../.env" });
}

const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

// Categories
const categories = [
  "Trending",
  "Rooms",
  "Iconic Cities",
  "Castles",
  "Amazing Pools",
  "Farms",
  "Arctic",
  "Homes",
  "Bed & breakfasts",
  "Boats",
];

// MongoDB URL
const MONGO_URL = process.env.ATLASDB_URL;

// Connect to DB
async function main() {
  if (!MONGO_URL) {
    throw new Error("❌ ATLASDB_URL is undefined. Check your .env file.");
  }

  await mongoose.connect(MONGO_URL);
  console.log("✅ Connected to DB");
}

// Initialize Database
const initDB = async () => {
  try {
    // Prepare data
    const updatedData = initData.data.map((obj) => ({
      ...obj,
      owner: new mongoose.Types.ObjectId(), // temporary valid ObjectId
      geometry: {
        type: "Point",
        coordinates: [77.2090, 28.6139], // default Delhi
      },
      category:
        categories[Math.floor(Math.random() * categories.length)],
    }));

    // Clear old data
    await Listing.deleteMany({});
    console.log("🗑️ Old data deleted");

    // Insert new data
    await Listing.insertMany(updatedData);
    console.log("✅ Data initialized successfully");

    mongoose.connection.close(); // close connection after insert
  } catch (err) {
    console.log("❌ Error inserting data:", err);
  }
};

// Run properly (IMPORTANT)
main()
  .then(() => {
    initDB(); // run only after DB connects
  })
  .catch((err) => {
    console.log("❌ DB Connection Error:", err);
  });