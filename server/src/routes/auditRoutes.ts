import { Router } from "express";
import { Role } from "@prisma/client";
import { authorizeRoles } from "../middleware/authorizeRole";
import { listAuditLogs } from "../controllers/auditController";

const router = Router();

router.use(authorizeRoles(Role.ADMIN));
router.get("/", listAuditLogs);

export default router;
