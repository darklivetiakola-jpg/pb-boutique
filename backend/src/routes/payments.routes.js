import { Router } from "express";
import { listPayments } from "../controllers/payments.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();
router.get("/", requireAuth, requireRole("ADMIN", "STAFF"), listPayments);
export default router;
