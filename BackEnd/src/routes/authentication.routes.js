const express = require("express");
const router = express.Router();
const authenicationController = require("../controller/authentication.controller");

// register route
router.post("/register", authenicationController.register);

// login route
router.post("/login", authenicationController.login);

module.exports = router;
