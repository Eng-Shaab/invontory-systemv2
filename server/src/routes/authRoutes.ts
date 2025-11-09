import { Router } from "express";
import { getCurrentUser, login, logout, smtpCheck, smtpDiagnostics } from "../controllers/authController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.post("/login", login);
router.get("/me", authMiddleware, getCurrentUser);
router.post("/logout", authMiddleware, logout);

// SMTP connectivity check (only for debugging; consider guarding in production via env flag)
router.get("/smtp-check", smtpCheck);
router.get("/smtp-diagnostics", smtpDiagnostics);

export default router;
