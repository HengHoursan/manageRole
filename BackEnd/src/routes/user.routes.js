const express = require("express");
const router = express.Router();
const userController = require("../controller/user.controller");
const verifyToken = require("../middleware/authentication");

// Update phone number
router.put("/phone", verifyToken, userController.updatePhoneNumber);

module.exports = router;
