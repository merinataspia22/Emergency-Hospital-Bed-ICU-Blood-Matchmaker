// Main backend adapter: reuse Member 1's Contact implementation without copying it.
import { Router } from "express";
import { createRateLimiter } from "../../member1-taspia/src/utils/rateLimiter.js";
import { sendContactMessage, getContactMessages } from "../../member1-taspia/src/controllers/contact.controller.js";
import { protect, authorizeRoles } from "../middleware/auth.middleware.js";

const router = Router();
const contactLimiter = createRateLimiter({ windowMs: 60 * 60 * 1000, limit: 5 });

router.post("/", contactLimiter, sendContactMessage);
router.get("/messages", protect, authorizeRoles("admin"), getContactMessages);

export default router;
