const User = require("../models/user");

module.exports.updateProfile = async (req, res) => {
  try {
    const { username, email } = req.body;
    const updateData = { username, email };

    if (req.file) {
      updateData.avatar = "/" + req.file.path.replace(/\\/g, "/");
    }

    await User.findByIdAndUpdate(req.user._id, updateData);
    res.redirect("/profile");
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).send("Failed to update profile");
  }
};