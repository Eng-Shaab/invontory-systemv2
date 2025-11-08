import { Router } from "express"
import { Role } from "@prisma/client"
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/productController"
import { authorizeRoles } from "../middleware/authorizeRole"

const router = Router()

router.get("/", getProducts)
router.get("/:id", getProductById)
router.post("/", authorizeRoles(Role.ADMIN), createProduct)
router.put("/:id", authorizeRoles(Role.ADMIN), updateProduct)
router.delete("/:id", authorizeRoles(Role.ADMIN), deleteProduct)

export default router