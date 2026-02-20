const TelegramBot = require("node-telegram-bot-api");
const config = require("../config/environment");

let bot = null;

function initBot() {
  if (!config.telegram.botToken) {
    console.error("TELEGRAM_BOT_TOKEN is not set. Bot will not start.");
    return;
  }

  // Use polling for local development, webhooks for production (optional)
  bot = new TelegramBot(config.telegram.botToken, { polling: true });

  // Simple /start command response
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(
      chatId,
      `👋 Hello ${msg.from.first_name || "there"}! I'm the login bot for Manage Role.\n\nPlease use the website to log in with Telegram.`,
    );
  });

  bot.on("polling_error", (error) => {
    // Avoid spamming logs for minor polling issues
    if (error.code !== "EFATAL") {
      console.warn("Telegram bot polling warning:", error.code);
    } else {
      console.error("Telegram bot fatal polling error:", error);
    }
  });

  console.log("🤖 Telegram bot initialized.");
}

module.exports = {
  initBot,
};
