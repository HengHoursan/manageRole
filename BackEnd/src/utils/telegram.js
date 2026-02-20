const crypto = require("crypto");
const config = require("../config/environment");

/**
 * Validate Telegram authentication data
 * @param {Object} userData - Telegram auth data
 * @returns {boolean}
 */
const validateTelegramAuth = (userData) => {
  const { hash, ...rest } = userData;
  console.log("[Telegram Utils] Validating auth data:", { hash, rest });

  if (!config.telegram.botToken) {
    console.error("[Telegram Utils] Missing Bot Token in config!");
    return false;
  }

  const secretKey = crypto
    .createHash("sha256")
    .update(config.telegram.botToken)
    .digest();

  const dataCheckString = Object.keys(rest)
    .sort()
    .map((key) => `${key}=${String(rest[key])}`)
    .join("\n");

  console.log("[Telegram Utils] Data check string:\n", dataCheckString);

  const hmac = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  console.log("[Telegram Utils] Computed HMAC:", hmac);
  console.log("[Telegram Utils] Received Hash:", hash);

  const isValid = hmac === hash.toLowerCase();
  console.log("[Telegram Utils] Validation result:", isValid);

  return isValid;
};

/**
 * Check if Telegram auth timestamp is valid
 * @param {number} authDate - Timestamp from Telegram
 * @returns {boolean}
 */
function isValidTelegramAuthDate(authDate) {
  const MAX_AUTH_AGE = 5 * 60; // 5 minutes in seconds
  const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
  return currentTime - authDate <= MAX_AUTH_AGE;
}

module.exports = { validateTelegramAuth, isValidTelegramAuthDate };
