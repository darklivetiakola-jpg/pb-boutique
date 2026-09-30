import { Router } from "express";
import { getStats } from "../controllers/dashboard.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();
router.get("/stats", requireAuth, requireRole("ADMIN", "STAFF"), getStats);

export default router;
