import { Router } from "express"
import {
  getSalesSummary,
  getInventorySummary,
  getCustomerSummary,
} from "../controllers/summaryController"

const router = Router()

// GET ONLY routes for summary data
router.get("/sales", getSalesSummary)
router.get("/inventory", getInventorySummary)
router.get("/customers", getCustomerSummary)

export default router