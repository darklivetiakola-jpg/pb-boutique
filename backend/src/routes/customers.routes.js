import { Router } from "express";
import { listCustomers } from "../controllers/customers.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();
router.get("/", requireAuth, requireRole("ADMIN", "STAFF"), listCustomers);
export default router;
