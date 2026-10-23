import express from "express";
import cors from "cors";
import bloodRequestRoutes from "./routes/bloodRequest.routes.js";
import { notFound, errorHandler } from "./middleware/error.middleware.js";

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ success: true, message: "API is running" }));

// ---- routes (prottek member nijer line ekhane add korbe) ----
app.use("/api/blood-requests", bloodRequestRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
