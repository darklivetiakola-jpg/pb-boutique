import { Router } from "express";
import {
  listProducts, getProduct, createProduct, updateProduct, deleteProduct,
  updateStock, listCategories,
} from "../controllers/products.controller.js";
import { requireAuth, requireRole, attachUserIfPresent } from "../middleware/auth.js";

const router = Router();

router.get("/categories", listCategories);
router.get("/", attachUserIfPresent, listProducts);
router.get("/:slug", attachUserIfPresent, getProduct);

router.post("/", requireAuth, requireRole("ADMIN", "STAFF"), createProduct);
router.patch("/:id", requireAuth, requireRole("ADMIN", "STAFF"), updateProduct);
router.delete("/:id", requireAuth, requireRole("ADMIN"), deleteProduct);
router.patch("/variants/:variantId/stock", requireAuth, requireRole("ADMIN", "STAFF"), updateStock);

export default router;
