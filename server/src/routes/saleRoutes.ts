import { Router } from "express"
import {
  createSale,
  getSales,
  getSaleById,
  updateSale,
  deleteSale,
} from "../controllers/saleController"

const router = Router()

router.get("/", getSales)
router.get("/:id", getSaleById)
router.post("/", createSale)
router.put("/:id", updateSale)
router.delete("/:id", deleteSale)

export default router