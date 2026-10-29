import { Router } from "express";
// import { protect, authorizeRoles } from "../middleware/auth.middleware.js"; // Middleware comment out ba remove kora holo
import {
  getBloodRequests, // Sob blood requests fetch korar jonno ei function ti lagbe
  createBloodRequest,
  getMyBloodRequests,
  updateBloodRequest,
  deleteBloodRequest,
} from "../controllers/bloodRequest.controller.js";

const router = Router();

// Token ba protection chara routes gulo open kora holo:
router.get("/", getBloodRequests);
router.post("/", createBloodRequest);
router.get("/me", getMyBloodRequests); 
router.patch("/:id", updateBloodRequest);
router.delete("/:id", deleteBloodRequest);

export default router;