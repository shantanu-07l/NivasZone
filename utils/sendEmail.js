require("dotenv").config();

const SibApiV3Sdk = require("sib-api-v3-sdk");

const defaultClient = SibApiV3Sdk.ApiClient.instance;

const apiKey = defaultClient.authentications["api-key"];

apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

module.exports.sendOTP = async (email, otp) => {

    try {

        const sendSmtpEmail = {

            sender: {
                email: "nutannmiet@gmail.com",
                name: "NivasZone"
            },

            to: [
                {
                    email: email
                }
            ],

            subject: "OTP Verification",

            htmlContent: `<h2>Your OTP is ${otp}</h2>`
        };

        await apiInstance.sendTransacEmail(sendSmtpEmail);

        console.log("✅ OTP Email Sent");

    } catch (err) {

        console.log("❌ Email Error:", err);

    }
};