const Listing=require("../models/listing");
// map box api
const mbxGeocoding=require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken=process.env.MAPBOX_TOKEN;
const geocodingClient=mbxGeocoding({accessToken:mapToken});;


module.exports.index=async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm=(req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListings=async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id).populate({path:"reviews",
    populate:{
      path:"author",
    },
  }).populate("owner");

  if (!listing) {
    req.flash("error","Listing you requested does not exist !");
    return res.redirect("/listings");
  }
  res.render("listings/show", { listing });
};

module.exports.createListing=async (req, res) => {
  let url=req.file.secure_url;
  let filename=req.file.filename;

  const newListing = new Listing(req.body.listing);
  newListing.owner=req.user._id;

  newListing.image={url,filename};

  let response= await geocodingClient.forwardGeocode({
          query: req.body.listing.location,
          limit: 1,
        })
        .send();
  newListing.geometry=response.body.features[0].geometry;
  let savedListing=await newListing.save();
  console.log(savedListing);
  req.flash("success","New Listing Created !");

  res.redirect("/listings");
};

//filter
module.exports.filterByCategory = async (req, res) => {
  const { cat } = req.params;
  const listings = await Listing.find({ category: cat });
  res.render("listings/index", { allListings: listings, cat});
};

module.exports.renderEditForm=async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error","Listing you requested does not exist !");
    return res.redirect("/listings");
  }
  let orignalImageUrl=listing.image.url;
  orignalImageUrl=orignalImageUrl.replace("/upload","/upload/w_250");

  res.render("listings/edit.ejs", { listing,orignalImageUrl});
};

module.exports.updateListing=async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id,{ ...req.body.listing },{ new: true, runValidators: true });

  if(typeof req.file!=="undefined"){
    let url=req.file.secure_url;
    let filename=req.file.filename;
    listing.image={url,filename};
  }
  let response= await geocodingClient.forwardGeocode({
          query: req.body.listing.location,
          limit: 1,
        })
        .send();
  
  listing.geometry=response.body.features[0].geometry;
  await listing.save();
  
  req.flash("success","Listing Updated !");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing=async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findOneAndDelete({ _id: id });
  console.log(deletedListing);
  req.flash("success","Listing Deleted !");
  res.redirect("/listings");
};

//search listing
module.exports.searchListing = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === "") {
      req.flash("error", "Search empty!");
      return res.redirect("/listings");
    }

    const listings = await Listing.find({
      $or: [
        { title: { $regex: q, $options: "i" } },
        { location: { $regex: q, $options: "i" } },
        { country: { $regex: q, $options: "i" } }
      ]
    });

    res.render("listings/index.ejs", { allListings: listings });

  } catch (err) {
    console.log("SEARCH ERROR:", err);
    res.redirect("/listings");
  }
};