import express from "express";
import cors from "cors";

import bloodRequestRoutes from "./routes/bloodRequest.routes.js";
import { notFound, errorHandler } from "./middleware/error.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import hospitalRoutes from "./routes/hospital.routes.js";
import contactRoutes from "./routes/contact.routes.js";
import userRoutes from "./routes/user.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import member5Routes from "../member5-blood-bank/src/routes/member5.routes.js";

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ success: true, message: "API is running" }));

// ---- Centralized Routes Mounting ----
app.use("/api/auth", authRoutes);
app.use("/api/bloodrequests", bloodRequestRoutes);
app.use("/api/blood-requests", bloodRequestRoutes); // Aliased for safety
app.use("/api/contact", contactRoutes);
app.use("/api/hospitals", hospitalRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/bloodbank", member5Routes); // Member 5: blood bank dashboard

app.use(notFound);
app.use(errorHandler);

export default app;