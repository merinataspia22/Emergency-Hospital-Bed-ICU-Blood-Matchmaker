import { Router } from "express";
import {
  getHospitals,
  getHospitalById,
  createHospital,
  updateHospital,
  deleteHospital,
} from "../controllers/hospital.controller.js";

const router = Router();

router.get("/", getHospitals);
router.get("/:id", getHospitalById);
router.post("/", createHospital);
router.put("/:id", updateHospital);
router.delete("/:id", deleteHospital);

export default router;