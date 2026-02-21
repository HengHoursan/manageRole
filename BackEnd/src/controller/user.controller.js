const db = require("../model");
const User = db.user;

exports.updatePhoneNumber = async (req, res) => {
  try {
    const { phone_number } = req.body;
    const userId = req.user.id;

    if (!phone_number) {
      return res.status(400).json({ message: "Phone number is required." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.phone_number = phone_number;
    await user.save();

    res.status(200).json({
      message: "Phone number updated successfully.",
      phone_number: user.phone_number,
    });
  } catch (error) {
    console.error("Error updating phone number:", error.message);
    res.status(500).json({ message: error.message });
  }
};
