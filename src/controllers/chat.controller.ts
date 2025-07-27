import { Request, Response } from "express";
import { geminiModel } from "../config/gemini";
import { saveChatHistory } from "../models/chat.model";
import { db } from "../config/firebase";
import { Timestamp } from "firebase-admin/firestore";

const USER_ID = "demo-user-001";

export const handleChat = async (req: Request, res: Response) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({
      status: "error",
      message: "Prompt is required",
    });
  }

  try {
    const result = await geminiModel.invoke(prompt);

    let replyText: string = "";

    if (typeof result.content === "string") {
      replyText = result.content;
    } else if (Array.isArray(result.content)) {
      replyText = result.content.map((c: any) => c?.text ?? "").join(" ");
    } else if (
      typeof result.content === "object" &&
      result.content !== null &&
      "text" in result.content
    ) {
      replyText = (result.content as { text?: string }).text ?? "";
    }

    replyText = replyText.replace(/\*\*|\n|\\n/g, "").replace(/\s+/g, " ").trim();

    const timestamp = new Date().toISOString();

    const chatData = {
      userId: USER_ID,
      prompt,
      response: replyText,
      timestamp,
    };

    await saveChatHistory(chatData);

    res.json({
      status: "success",
      message: "Chat response generated successfully.",
      data: {
        prompt,
        reply: {
          text: replyText,
        },
        usage: {
          input_tokens: result.usage_metadata?.input_tokens ?? 0,
          output_tokens: result.usage_metadata?.output_tokens ?? 0,
          total_tokens: result.usage_metadata?.total_tokens ?? 0,
        },
        timestamp,
      },
    });
  } catch (error) {
    console.error("Gemini or Firestore error:", error);
    res.status(500).json({
      status: "error",
      message: "Something went wrong while generating response.",
    });
  }
};

export const getChatHistory = async (req: Request, res: Response) => {
  const { user_id } = req.params;

  try {
    const snapshot = await db
      .collection("chat_history")
      .where("userId", "==", user_id)
      .orderBy("timestamp", "desc")
      .get();

    const history = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({
      status: "success",
      data: history,
    });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({ status: "error", message: "Failed to get chat history" });
  }
};

export const updateChatHistory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { prompt, response } = req.body;

  if (!prompt && !response) {
    return res.status(400).json({ status: "error", message: "No fields to update" });
  }

  try {
    const ref = db.collection("chat_history").doc(id);
    const doc = await ref.get();

    if (!doc.exists) {
      return res.status(404).json({ status: "error", message: "Chat history not found" });
    }

    const updateData: any = {
      timestamp: Timestamp.now(),
    };

    if (prompt) {
      updateData.prompt = prompt;

      const result = await geminiModel.invoke(prompt);

      let newReplyText = "";

      if (typeof result.content === "string") {
        newReplyText = result.content;
      } else if (Array.isArray(result.content)) {
        newReplyText = result.content.map((c: any) => c?.text ?? "").join(" ");
      } else if (typeof result.content === "object" && result.content !== null && "text" in result.content) {
        newReplyText = (result.content as { text?: string }).text ?? "";
      }

      newReplyText = newReplyText.replace(/\*\*|\n|\\n/g, "").replace(/\s+/g, " ").trim();

      updateData.response = newReplyText;
    }

    if (!prompt && response) {
      updateData.response = response;
    }

    await ref.update(updateData);

    res.json({
      status: "success",
      message: "Chat history updated successfully",
      data: updateData,
    });
  } catch (error) {
    console.error("Error updating chat history:", error);
    res.status(500).json({ status: "error", message: "Failed to update chat history" });
  }
};

export const deleteChatHistory = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const ref = db.collection("chat_history").doc(id);
    const doc = await ref.get();

    if (!doc.exists) {
      return res.status(404).json({ status: "error", message: "Chat history not found" });
    }

    await ref.delete();

    res.json({ status: "success", message: "Chat history deleted successfully" });
  } catch (error) {
    console.error("Error deleting chat history:", error);
    res.status(500).json({ status: "error", message: "Failed to delete chat history" });
  }
};
