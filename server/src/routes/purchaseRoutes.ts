import { Router } from "express"
import { Role } from "@prisma/client"
import {
  createPurchase,
  getPurchases,
  getPurchaseById,
  updatePurchase,
  deletePurchase,
} from "../controllers/purchaseController"
import { authorizeRoles } from "../middleware/authorizeRole"

const router = Router()

router.get("/", getPurchases)
router.get("/:id", getPurchaseById)
router.post("/", authorizeRoles(Role.ADMIN), createPurchase)
router.put("/:id", authorizeRoles(Role.ADMIN), updatePurchase)
router.delete("/:id", authorizeRoles(Role.ADMIN), deletePurchase)

export default router