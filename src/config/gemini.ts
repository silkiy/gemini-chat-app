import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

export const geminiModel = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  temperature: 0,
  apiKey: process.env.GOOGLE_API_KEY,
});
