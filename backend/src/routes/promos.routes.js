import { Router } from "express";
import {
  listActive, listAll, createPromo, updatePromo, deletePromo, listFlash, setFlash, clearFlash,
} from "../controllers/promos.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();
const staff = [requireAuth, requireRole("ADMIN", "STAFF")];

router.get("/active", listActive);                       // public (boutique)
router.get("/flash", ...staff, listFlash);
router.put("/flash/:productId", ...staff, setFlash);
router.delete("/flash/:productId", ...staff, clearFlash);
router.get("/", ...staff, listAll);
router.post("/", ...staff, createPromo);
router.patch("/:id", ...staff, updatePromo);
router.delete("/:id", ...staff, deletePromo);

export default router;
