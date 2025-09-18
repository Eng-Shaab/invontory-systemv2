import { Router } from "express"
import {
  createPurchase,
  getPurchases,
  getPurchaseById,
  updatePurchase,
  deletePurchase,
} from "../controllers/purchaseController"

const router = Router()

router.get("/", getPurchases)
router.get("/:id", getPurchaseById)
router.post("/", createPurchase)
router.put("/:id", updatePurchase)
router.delete("/:id", deletePurchase)

export default router