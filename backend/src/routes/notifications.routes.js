import { Router } from "express";
import { listMine, markRead } from "../controllers/notifications.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.get("/", requireAuth, listMine);
router.post("/read", requireAuth, markRead);
export default router;
