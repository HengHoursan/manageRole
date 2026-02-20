const express = require("express");
const router = express.Router();
const authenicationController = require("../controller/authentication.controller");

// register route
router.post("/register", authenicationController.register);

// login route
router.post("/login", authenicationController.login);

// telegram login route (widget-based - kept as fallback)
router.post("/telegram-login", authenicationController.telegramLogin);

// telegram mini app login route
router.post(
  "/telegram-webapp-login",
  authenicationController.telegramWebAppLogin,
);

module.exports = router;
