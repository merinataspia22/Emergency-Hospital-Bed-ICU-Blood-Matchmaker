import { Router } from "express";
import { protect, authorizeRoles } from "../middleware/auth.middleware.js";
import {
  addMyDonation, getDonorContact, getMyHistory, getMyProfile,
  searchDonors, updateMyAvailability, updateMyProfile,
} from "../controllers/donor.controller.js";
import { getMyRequests, respondToRequest } from "../controllers/donorRequest.controller.js";
import { setMyAvatar } from "../controllers/donorAvatar.controller.js";
import { setMyLocation } from "../controllers/donorLocation.controller.js";

const router = Router();

// Public: Find Donor page (phone/email dekhay na)
router.get("/", searchDonors);

// Donor Dashboard: shudhu donor role
router.use("/me", protect, authorizeRoles("donor"));
router.get("/me", getMyProfile);
router.patch("/me", updateMyProfile);
router.patch("/me/availability", updateMyAvailability);
router.patch("/me/avatar", setMyAvatar);
router.patch("/me/location", setMyLocation);
router.get("/me/history", getMyHistory);
router.post("/me/history", addMyDonation);
router.get("/me/requests", getMyRequests);
router.post("/me/requests/:id/respond", respondToRequest);

// Donor er phone number
router.get("/:id/contact", protect, authorizeRoles("recipient", "staff", "admin"), getDonorContact);

export default router;
