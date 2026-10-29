import express from "express";
import cors from "cors";

import bloodRequestRoutes from "./routes/bloodRequest.routes.js";
import { notFound, errorHandler } from "./middleware/error.middleware.js"; 
import authRoutes from "./routes/auth.routes.js";
import contactRoutes from "./routes/contact.routes.js";
import donorRoutes from "./routes/donor.routes.js";
import messageRoutes from "./routes/message.routes.js";
import hospitalRoutes from "./routes/hospital.routes.js";
import userRoutes from "./routes/user.routes.js";
import adminRoutes from "./routes/admin.routes.js";

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "1mb" })); // donor profile photo er jonno

app.get("/api/health", (_req, res) => res.json({ success: true, message: "API is running" }));

// ---- Centralized Routes Mounting ----
app.use("/api/auth", authRoutes);
app.use("/api/bloodrequests", bloodRequestRoutes);
app.use("/api/blood-requests", bloodRequestRoutes); // Aliased for safety
app.use("/api/contact", contactRoutes);
app.use("/api/donors", donorRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/hospitals", hospitalRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;