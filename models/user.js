const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const passportLocalMongoose=require("passport-local-mongoose").default;

const userSchema=new Schema({
    username:{
        type:String,
        unique:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },

    phone:{
        type:String,
        default:""
    },
    avatar:{
        
    url:{
      type:String,
      default:"https://cdn-icons-png.flaticon.com/512/149/149071.png"
      },
   filename:String
    },
    otp:String,
    otpExpiry:Date,

});
userSchema.plugin(passportLocalMongoose);

module.exports=mongoose.model("User",userSchema);
