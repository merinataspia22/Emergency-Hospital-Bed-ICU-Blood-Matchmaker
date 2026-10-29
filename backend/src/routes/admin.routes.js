import { Router } from "express";
// import { protect, authorizeRoles } from "../middleware/auth.middleware.js"; // Eke comment out korun
import { getAdminOverview } from "../controllers/admin.controller.js";
import { getUsers, createUser, updateUser, deleteUser } from "../controllers/user.controller.js";

const router = Router();

// Token check ba middleware remove kora holo jate data freely load hote pare:
router.get("/overview", getAdminOverview);
router.get("/users", getUsers);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

export default router;