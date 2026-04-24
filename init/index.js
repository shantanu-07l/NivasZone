const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

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
  "Boats"
];

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  initData.data=initData.data.map((obj)=>({
    ...obj,owner:"69cf924868a1345c3b49876f",
    geometry: {
    type: "Point",
    coordinates: [77.2090, 28.6139], // default (Delhi)
    },
    category: categories[Math.floor(Math.random() * categories.length)],
  }));
  await Listing.deleteMany({});
  await Listing.insertMany(initData.data);
  console.log("data was initialized");
};

initDB();