require("dotenv").config();

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.USER_PASS,
    }
});

module.exports.sendOTP = async (email, otp) => {

    try {

        await transporter.sendMail({
            from: process.env.USER_EMAIL,
            to: email,
            subject: "OTP Verification",
            text: `Your OTP is ${otp}`
        });

        console.log("✅ OTP Email Sent");

    } catch (err) {

        console.log("❌ Email Error:", err);

    }
};