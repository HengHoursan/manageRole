const crypto = require("crypto");
const config = require("../config/environment");

/**
 * Validate Telegram authentication data
 * @param {Object} userData - Telegram auth data
 * @returns {boolean}
 */
const validateTelegramAuth = (userData) => {
  const { hash, ...rest } = userData;

  // 1. Safety check for the token
  if (!config.telegram.botToken) {
    console.error("TELEGRAM_BOT_TOKEN is missing!");
    return false;
  }

  // 2. Data-check-string MUST use newlines (\n) for the Login Widget
  const dataCheckString = Object.keys(rest)
    .sort()
    .map((key) => `${key}=${rest[key]}`)
    .join("\n");

  // 3. Create secret key: SHA256 of the bot token (Widget method)
  const secretKey = crypto
    .createHash("sha256")
    .update(config.telegram.botToken)
    .digest();

  // 4. Generate HMAC-SHA256
  const hmac = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  return hmac === hash;
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
