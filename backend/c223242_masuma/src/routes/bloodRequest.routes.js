import { Router } from "express";
import { protect, authorizeRoles } from "../middleware/auth.middleware.js";
import {
  createBloodRequest,
  getMyBloodRequests,
  updateBloodRequest,
} from "../controllers/bloodRequest.controller.js";

const router = Router();

router.use(protect, authorizeRoles("recipient"));

router.post("/", createBloodRequest);
router.get("/me", getMyBloodRequests); // "/me" ke "/:id" er age rakhte hobe
router.patch("/:id", updateBloodRequest);

export default router;
