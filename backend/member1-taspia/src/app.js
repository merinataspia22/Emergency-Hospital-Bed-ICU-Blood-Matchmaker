import express from "express";
import cors from "cors";
import helmet from "helmet";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.routes.js";
import contactRoutes from "./routes/contact.routes.js";
import { env } from "./config/env.js";
import { errorHandler, notFound } from "./middleware/error.middleware.js";
import ApiError from "./utils/ApiError.js";

const app = express();
app.set("trust proxy", env.trustProxy);
app.disable("x-powered-by");
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || env.frontendOrigins.includes(origin)) return callback(null, true);
    return callback(new ApiError(403, "Frontend origin not allowed"));
  },
}));
app.use(express.json({ limit: "20kb" }));
app.get("/api/health", (_req, res) => res.json({
  success: true,
  message: "BloodConnect API is running",
  data: { database: mongoose.connection.readyState === 1 ? "connected" : "disconnected" },
}));
app.use("/api/auth", authRoutes);
app.use("/api/contact", contactRoutes);
// Other team modules are mounted here by the integration owner.
app.use(notFound);
app.use(errorHandler);
export default app;
