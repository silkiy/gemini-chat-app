import { db } from "../config/firebase";
import { Timestamp } from "firebase-admin/firestore";

interface ChatHistory {
  userId: string;
  prompt: string;
  response: any;
  timestamp: FirebaseFirestore.Timestamp;
}

export const saveChatHistory = async (data: Omit<ChatHistory, "timestamp">) => {
  const ref = db.collection("chat_history");
  await ref.add({
    ...data,
    timestamp: new Date(),
  });
};
