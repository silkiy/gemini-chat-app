import { Router } from "express";
import { getChatHistory, handleChat } from "../controllers/chat.controller";

const router = Router();

router.post("/chat", handleChat);
router.get("/chat/history/:user_id", getChatHistory);

export default router;
