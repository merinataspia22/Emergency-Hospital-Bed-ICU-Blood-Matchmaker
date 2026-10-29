import { Router } from "express";
import { getAdminOverview, getUsers, createUser, updateUser, deleteUser } from "../controllers/admin.controller.js";

const router = Router();

router.get("/overview", getAdminOverview);
router.get("/users", getUsers);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

export default router;