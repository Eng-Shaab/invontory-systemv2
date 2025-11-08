import { Router } from "express"
import {
  createSale,
  getSales,
  getSaleById,
  updateSale,
  deleteSale,
} from "../controllers/saleController"
import { Role } from "@prisma/client"
import { authorizeRoles } from "../middleware/authorizeRole"

const router = Router()

router.get("/", getSales)
router.get("/:id", getSaleById)
router.post("/", authorizeRoles(Role.ADMIN), createSale)
router.put("/:id", authorizeRoles(Role.ADMIN), updateSale)
router.delete("/:id", authorizeRoles(Role.ADMIN), deleteSale)

export default router