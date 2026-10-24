import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const userHistories = new Map();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

const bot = new TelegramBot(process.env.BOT_TOKEN, {
  polling: true
});

console.log("Telegram bot started!");

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "Є контакт"
  );
});

bot.on("message", async (msg) => {
  if (!msg.text || msg.text.startsWith("/")) {
    return;
  }

  const userId = msg.from.id;
  const history = userHistories.get(userId) || [];

  history.push({
    role: "user",
    parts: [{ text: msg.text }]
  });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: history,
      config: {
        systemInstruction:
          "Ти дружній помічник з англійської мови. Допомагай користувачу вивчати англійську, виправляй помилки та пояснюй їх просто."
      }
    });

history.push({
  role: "model",
  parts: [{ text: response.text }]
});

userHistories.set(userId, history);

    await bot.sendMessage(msg.chat.id, response.text);

  } catch (error) {
    console.error("Gemini error:", error);

    await bot.sendMessage(
      msg.chat.id,
      "Сталася помилка під час звернення до AI."
    );
  }
});