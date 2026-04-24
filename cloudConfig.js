const cloudinary = require("cloudinary");
const CloudinaryStorage = require("multer-storage-cloudinary");

 
cloudinary.v2.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.CLOUD_API_KEY,
    api_secret:process.env.CLOUD_API_SECRET,

});

//file storage location
const storage= new CloudinaryStorage({
    cloudinary:cloudinary,
    params:{
        folder:"wanderlust_DEV",
        allowed_formats:["png","jpg","jpeg"],
    },
});

module.exports={
    cloudinary,
    storage,
};