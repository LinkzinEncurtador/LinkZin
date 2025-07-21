const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: false });
function sendAlert(msg) {
  bot.sendMessage(process.env.TELEGRAM_CHAT_ID, msg);
}
module.exports = { sendAlert }; 