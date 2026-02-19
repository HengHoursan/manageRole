const express = require("express");
const router = express.Router();
const authenicationController = require("../controller/authentication.controller");

// register route
router.post("/register", authenicationController.register);

// login route
router.post("/login", authenicationController.login);

// telegram login route (widget-based - kept as fallback)
router.post("/telegram-login", authenicationController.telegramLogin);

// telegram deep link auth routes
router.get("/telegram-init", authenicationController.telegramInit);
router.get("/telegram-status/:token", authenicationController.telegramStatus);

module.exports = router;
