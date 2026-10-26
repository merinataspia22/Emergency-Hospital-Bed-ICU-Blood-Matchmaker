
import { Router } from "express";
import {
  getAllBloodStock,
  getBloodStockByGroup,
} from "../controllers/hospital.controller.js";

const router = Router();

router.get("/stock", getAllBloodStock);
router.get("/stock/:bloodGroup", getBloodStockByGroup);

export default router;
