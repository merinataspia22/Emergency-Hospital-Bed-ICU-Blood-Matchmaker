import { Router } from "express";
import { createRateLimiter } from "../utils/rateLimiter.js";
import { getContactMessages, sendContactMessage } from "../controllers/contact.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";

const router = Router();
const contactLimiter = createRateLimiter({ windowMs: 60 * 60 * 1000, limit: 5 });

// Public Home form; messages are saved, NOT emailed.
router.post("/", contactLimiter, sendContactMessage);
// Admin teammate can connect their inbox here; no admin account creation in this module.
router.get("/messages", requireAuth, allowRoles("admin"), getContactMessages);
export default router;
