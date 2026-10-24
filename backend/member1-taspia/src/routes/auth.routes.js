import { Router } from "express";
import { createRateLimiter } from "../utils/rateLimiter.js";
import { login, me, register } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();
const loginLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, limit: 10 });
const registerLimiter = createRateLimiter({ windowMs: 60 * 60 * 1000, limit: 15 });

router.post("/register", registerLimiter, register);
router.post("/login", loginLimiter, login);
router.get("/me", requireAuth, me);
export default router;
