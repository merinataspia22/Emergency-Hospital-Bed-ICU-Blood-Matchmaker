import express from "express";
import cors from "cors";
import donorRoutes from "./routes/donor.routes.js";
import messageRoutes from "./routes/message.routes.js";
import { notFound, errorHandler } from "./middleware/error.middleware.js";

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" })); // profile photo er jonno

app.get("/api/health", (_req, res) => res.json({ success: true, message: "Member2 donor API is running" }));

app.use("/api/donors", donorRoutes);
app.use("/api/messages", messageRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
