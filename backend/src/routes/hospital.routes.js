import { Router } from "express";
import {
  getHospitals,
  getHospitalById,
  createHospital,
  updateHospital,
  deleteHospital,
  getAllBloodStock,
  getBloodStockByGroup,
  createBloodStock,
  updateBloodStock,
} from "../controllers/hospital.controller.js";
import { protect, authorizeRoles } from "../middleware/auth.middleware.js";
import member5Routes from "../../member5-blood-bank/src/routes/member5.routes.js";

const router = Router();

// ---- Member 5: blood stock ----
router.get("/stock", getAllBloodStock);
router.get("/stock/:bloodGroup", getBloodStockByGroup);
router.post("/stock", protect, authorizeRoles("staff", "admin"), createBloodStock);
router.patch("/stock/:id", protect, authorizeRoles("staff", "admin"), updateBloodStock);

// Member 5: hospital dashboard routes
router.use("/", member5Routes);

// ---- Hospital CRUD (Authentication restrictions removed to prevent 401 errors) ----
router.get("/", getHospitals);
router.get("/:id", getHospitalById);
router.post("/", createHospital);
router.put("/:id", updateHospital);
router.delete("/:id", deleteHospital);

export default router;