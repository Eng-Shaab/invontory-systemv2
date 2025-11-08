import { Router } from "express"
import { Role } from "@prisma/client"
import {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} from "../controllers/customerController"
import { authorizeRoles } from "../middleware/authorizeRole"

const router = Router()

router.get("/", getCustomers)
router.get("/:id", getCustomerById)
router.post("/", authorizeRoles(Role.ADMIN), createCustomer)
router.put("/:id", authorizeRoles(Role.ADMIN), updateCustomer)
router.delete("/:id", authorizeRoles(Role.ADMIN), deleteCustomer)

export default router