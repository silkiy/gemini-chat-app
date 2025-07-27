import { Router } from "express";
import { getChatHistory, handleChat, updateChatHistory, deleteChatHistory } from "../controllers/chat.controller";

const router = Router();

router.post("/chat", handleChat);
router.get("/chat/history/:user_id", getChatHistory);
router.put("/chat/:id", updateChatHistory);
router.delete("/chat/:id", deleteChatHistory);

export default router;
