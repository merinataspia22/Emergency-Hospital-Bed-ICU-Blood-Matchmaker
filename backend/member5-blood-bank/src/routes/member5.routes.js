import { Router } from "express";
import {
  protect,
  authorizeRoles,
} from "../../../src/middleware/auth.middleware.js";

import {
  getMyHospitalStock,
  updateMyHospitalStock,
  getMyHospitalRequests,
  getMyHospitalSummary,
  listStaff,
} from "../controllers/member5.controller.js";

const router = Router();

const hospitalStaff = [
  protect,
  authorizeRoles("staff", "admin"),
];

router.get("/me/stock", ...hospitalStaff, getMyHospitalStock);
router.patch("/me/stock/:group", ...hospitalStaff, updateMyHospitalStock);
router.get("/me/requests", ...hospitalStaff, getMyHospitalRequests);
router.get("/me/summary", ...hospitalStaff, getMyHospitalSummary);

router.get(
  "/staff",
  protect,
  authorizeRoles("admin"),
  listStaff
);

export default router;