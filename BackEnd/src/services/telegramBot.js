const TelegramBot = require("node-telegram-bot-api");
const crypto = require("crypto");
const config = require("../config/environment");

// In-memory store for pending auth sessions
// Format: token -> { status: 'pending'|'completed', userData: {...}, createdAt: Date }
const pendingAuthSessions = new Map();

// Clean up expired sessions every 5 minutes
setInterval(
  () => {
    const now = Date.now();
    for (const [token, session] of pendingAuthSessions) {
      if (now - session.createdAt > 5 * 60 * 1000) {
        pendingAuthSessions.delete(token);
      }
    }
  },
  5 * 60 * 1000,
);

let bot = null;

function initBot() {
  if (!config.telegram.botToken) {
    console.error("TELEGRAM_BOT_TOKEN is not set. Bot will not start.");
    return;
  }

  bot = new TelegramBot(config.telegram.botToken, { polling: true });

  bot.onText(/\/start(.*)/, (msg, match) => {
    const chatId = msg.chat.id;
    const param = match[1]?.trim();

    // Check if this is an auth deep link: /start auth_TOKEN
    if (param && param.startsWith("auth_")) {
      const token = param.substring(5); // Remove "auth_" prefix
      const session = pendingAuthSessions.get(token);

      if (!session) {
        bot.sendMessage(
          chatId,
          "❌ Login link expired or invalid. Please try again on the website.",
        );
        return;
      }

      if (session.status === "completed") {
        bot.sendMessage(chatId, "✅ You are already logged in!");
        return;
      }

      // Store user data from Telegram message
      session.status = "completed";
      session.userData = {
        id: msg.from.id.toString(),
        first_name: msg.from.first_name || "",
        last_name: msg.from.last_name || "",
        username: msg.from.username || "",
        photo_url: "", // Not available from message, but that's OK
      };

      pendingAuthSessions.set(token, session);

      bot.sendMessage(
        chatId,
        `✅ Login successful! You can close this and go back to the website.\n\nWelcome, ${msg.from.first_name}! 🎉`,
      );
    } else {
      // Regular /start command
      bot.sendMessage(
        chatId,
        `👋 Hello ${msg.from.first_name}! I'm the login bot for Manage Role.\n\nUse the website to log in with Telegram.`,
      );
    }
  });

  bot.on("polling_error", (error) => {
    console.error("Telegram bot polling error:", error.code);
  });

  console.log("🤖 Telegram bot started successfully!");
}

// Create a new auth session and return the token + deep link
function createAuthSession() {
  const token = crypto.randomBytes(16).toString("hex");
  pendingAuthSessions.set(token, {
    status: "pending",
    userData: null,
    createdAt: Date.now(),
  });

  const deepLink = `https://t.me/${config.telegram.botUsername}?start=auth_${token}`;
  return { token, deepLink };
}

// Check if an auth session is completed
function getAuthSession(token) {
  return pendingAuthSessions.get(token) || null;
}

// Remove a completed session
function removeAuthSession(token) {
  pendingAuthSessions.delete(token);
}

module.exports = {
  initBot,
  createAuthSession,
  getAuthSession,
  removeAuthSession,
};
