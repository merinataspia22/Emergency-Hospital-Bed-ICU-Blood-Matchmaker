import express from "express";
import cors from "cors";
import bloodRequestRoutes from "./routes/bloodRequest.routes.js";
import { notFound, errorHandler } from "./middleware/error.middleware.js"; 
import authRoutes from "./routes/auth.routes.js";
import hospitalRoutes from "./routes/hospital.routes.js";

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5175" }));
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ success: true, message: "API is running" }));


 // ---- routes ----
app.use("/api/auth", authRoutes);
app.use("/api/blood-requests", bloodRequestRoutes);
app.use("/api/hospitals", hospitalRoutes);


app.use(notFound);
app.use(errorHandler);

export default app;
