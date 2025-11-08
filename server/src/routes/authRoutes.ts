import { Router } from "express";
import { getCurrentUser, login, logout, verifyTwoFactorCode } from "../controllers/authController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.post("/login", login);
router.post("/verify-otp", verifyTwoFactorCode);
router.get("/me", authMiddleware, getCurrentUser);
router.post("/logout", authMiddleware, logout);

export default router;
