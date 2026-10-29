import express from "express";
import cors from "cors";
import bloodRequestRoutes from "./routes/bloodRequest.routes.js";
import { notFound, errorHandler } from "./middleware/error.middleware.js"; 
import authRoutes from "./routes/auth.routes.js";
import contactRoutes from "./routes/contact.routes.js";
import donorRoutes from "./routes/donor.routes.js";
import messageRoutes from "./routes/message.routes.js";

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" })); // donor profile photo er jonno

app.get("/api/health", (_req, res) => res.json({ success: true, message: "API is running" }));


 // ---- routes ----
app.use("/api/auth", authRoutes);
app.use("/api/blood-requests", bloodRequestRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/donors", donorRoutes);
app.use("/api/messages", messageRoutes);


app.use(notFound);
app.use(errorHandler);

export default app;