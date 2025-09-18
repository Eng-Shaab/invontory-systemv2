import { Router } from "express"
import {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} from "../controllers/customerController"

const router = Router()

router.get("/", getCustomers)
router.get("/:id", getCustomerById)
router.post("/", createCustomer)
router.put("/:id", updateCustomer)
router.delete("/:id", deleteCustomer)

export default router