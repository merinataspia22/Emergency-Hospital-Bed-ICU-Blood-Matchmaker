import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import { getConversations, getThread, sendMessage } from "../controllers/message.controller.js";

const router = Router();
router.use(protect); // je kono login kora user

router.get("/", getConversations);
router.get("/:userId", getThread);
router.post("/:userId", sendMessage);

export default router;
