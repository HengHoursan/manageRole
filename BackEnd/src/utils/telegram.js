const crypto = require("crypto");
const config = require("../config/environment");

/**
 * Validate Telegram authentication data
 * @param {Object} userData - Telegram auth data
 * @returns {boolean}
 */
const validateTelegramAuth = (userData) => {
  const { hash, ...rest } = userData;

  // Telegram bot token is essential for validation
  if (!config.telegram.botToken) {
    console.error("TELEGRAM_BOT_TOKEN is not configured in environment variables.");
    return false;
  }

  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(config.telegram.botToken)
    .digest();

  const dataCheckString = Object.keys(rest)
    .filter(key => key !== 'hash') // Exclude hash from data-check-string
    .sort()
    .map((key) => `${key}=${String(rest[key])}`)
    .join("");
    

  const hmac = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  return hmac === hash.toLowerCase(); // Ensure both are lowercase
};

/**
 * Check if Telegram auth timestamp is valid
 * @param {number} authDate - Timestamp from Telegram
 * @returns {boolean}
 */
function isValidTelegramAuthDate(authDate) {
  const MAX_AUTH_AGE = 300; // 5 minutes (300 seconds)
  const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
  return currentTime - authDate <= MAX_AUTH_AGE;
}

module.exports = { validateTelegramAuth, isValidTelegramAuthDate };
