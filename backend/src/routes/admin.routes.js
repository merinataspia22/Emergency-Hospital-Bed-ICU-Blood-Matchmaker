import { Router } from "express";
import { getAdminOverview, getUsers, createUser, updateUser, deleteUser } from "../controllers/admin.controller.js";
import { protect, authorizeRoles } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/overview", protect, authorizeRoles("admin"), getAdminOverview);
router.get("/users", protect, authorizeRoles("admin"), getUsers);
router.post("/users", protect, authorizeRoles("admin"), createUser);
router.put("/users/:id", protect, authorizeRoles("admin"), updateUser);
router.delete("/users/:id", protect, authorizeRoles("admin"), deleteUser);

export default router;