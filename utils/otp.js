const otpGenerator = require("otp-generator");

// module.exports.generateOTP = () => {
//     return otpGenerator.generate(6, {
//         upperCaseAlphabets: false,
//         lowerCaseAlphabets:false,
//         specialChars: false,
//     });
// };
module.exports.generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};