const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user:process.env.USER_EMAIL,
        pass:process.env.USER_PASS,
    }
});

module.exports.sendOTP = async (email, otp) => {
    
    await transporter.sendMail({
        from:process.env.USER_EMAIL,
        to: email,
        subject: "OTP Verification",
        text: `Your OTP is ${otp}`
    });
};