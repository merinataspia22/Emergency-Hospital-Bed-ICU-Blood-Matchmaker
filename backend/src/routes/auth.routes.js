
import { Router } from "express";
import { register, login, me } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

// Google Login - Member 1
import { googleSignIn } from "../../member1-taspia/src/controllers/googleAuth.controller.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);

// New Google Login route
router.post("/google", googleSignIn);

router.get("/me", protect, me);

export default router;
