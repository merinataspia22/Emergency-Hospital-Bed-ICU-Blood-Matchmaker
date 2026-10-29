import { Router } from "express";
import { getAdminOverview, getUsers, createUser, updateUser, deleteUser } from "../controllers/admin.controller.js";

const router = Router();

// টোকেন বা প্রটেকশন ছাড়াই অ্যাডমিন রাউটগুলো ওপেন করা হলো যাতে 401 Unauthorized এরর না আসে
router.get("/overview", getAdminOverview);
router.get("/users", getUsers);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

export default router;