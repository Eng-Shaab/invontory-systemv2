import { Router } from "express";
import { Role } from "@prisma/client";
import { authorizeRoles } from "../middleware/authorizeRole";
import {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/userController";

const router = Router();

router.use(authorizeRoles(Role.ADMIN));

router.get("/", listUsers);
router.get("/:id", getUserById);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
