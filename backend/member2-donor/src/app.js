import express from "express";
import cors from "cors";
import donorRoutes from "./routes/donor.routes.js";
import messageRoutes from "./routes/message.routes.js";
import { notFound, errorHandler } from "./middleware/error.middleware.js";

const app = express();

// Local dev e je kono localhost port theke website cholle kaj kore, ar CLIENT_URL e deya url o.
const allowed = (process.env.CLIENT_URL || "").split(",").map((s) => s.trim()).filter(Boolean);
const isLocal = (o) => /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(o);
app.use(cors({ origin: (origin, cb) => cb(null, !origin || isLocal(origin) || allowed.includes(origin)) }));
app.use(express.json({ limit: "1mb" })); // profile photo er jonno

app.get("/api/health", (_req, res) => res.json({ success: true, message: "Member2 donor API is running" }));

app.use("/api/donors", donorRoutes);
app.use("/api/messages", messageRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
