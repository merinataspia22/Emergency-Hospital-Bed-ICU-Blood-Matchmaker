
import { Router } from "express";
import {
  getAllBloodStock,
  getBloodStockByGroup,
  createBloodStock,
  updateBloodStock,
} from "../controllers/hospital.controller.js";
import {
  protect,
  authorizeRoles,
} from "../middleware/auth.middleware.js";
import member5Routes from "../../member5-blood-bank/src/routes/member5.routes.js";

const router = Router();

// Public: get all blood stock
router.get("/stock", getAllBloodStock);

// Public: get stock by blood group
router.get("/stock/:bloodGroup", getBloodStockByGroup);

// Only staff/admin can add blood stock
router.post(
  "/stock",
  protect,
  authorizeRoles("staff", "admin"),
  createBloodStock
);

// Only staff/admin can update blood stock
router.patch(
  "/stock/:id",
  protect,
  authorizeRoles("staff", "admin"),
  updateBloodStock
);

// Member 5: hospital dashboard routes
router.use("/", member5Routes);

export default router;
