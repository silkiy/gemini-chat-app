import express, { Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();
import router from "./routers/chat.routes";
import { createServer } from "http";
import { parse } from "url";

const app = express();
const PORT: number = parseInt(process.env.PORT || "3000", 10);

app.use(express.json());
app.use("/api", router);

app.use((req: Request, res: Response) => {
  res.status(404).json({
    message: "NOT FOUND",
    code: 404,
  });
});

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

if (process.env.DOCKER) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Docker server running on http://0.0.0.0:${PORT}`);
  });
} else if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default function handler(req: any, res: any) {
  const parsedUrl = parse(req.url!, true);
  req.query = parsedUrl.query;
  app(req as any, res as any);
}