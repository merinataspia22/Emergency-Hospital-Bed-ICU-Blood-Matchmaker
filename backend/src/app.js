import express from "express";
import cors from "cors";
import bloodRequestRoutes from "./routes/bloodRequest.routes.js";
import { notFound, errorHandler } from "./middleware/error.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import hospitalRoutes from "./routes/hospital.routes.js";
import contactRoutes from "./routes/contact.routes.js";
import member5Routes from "../member5-blood-bank/src/routes/member5.routes.js";

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ success: true, message: "API is running" }));

// ---- routes ----
app.use("/api/auth", authRoutes);
app.use("/api/blood-requests", bloodRequestRoutes);
app.use("/api/hospitals", hospitalRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/bloodbank", member5Routes);

app.use(notFound);
app.use(errorHandler);

export default app;