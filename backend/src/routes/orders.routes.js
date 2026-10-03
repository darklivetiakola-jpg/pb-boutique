import { Router } from "express";
import { checkout, cinetpayWebhook, listOrders, updateOrderStatus } from "../controllers/orders.controller.js";
import { requireAuth, requireRole, attachUserIfPresent } from "../middleware/auth.js";

const router = Router();

router.post("/checkout", requireAuth, checkout);   // commande réservée aux comptes connectés
router.get("/", requireAuth, listOrders);
router.patch("/:id/status", requireAuth, requireRole("ADMIN", "STAFF"), updateOrderStatus);

// Le corps brut (Buffer) est déjà fourni par le middleware monté dans app.js
// (nécessaire pour vérifier la signature HMAC avant tout parsing JSON).
router.post("/webhook", (req, res, next) => {
  req.rawBody = req.body.toString("utf8");
  req.body = JSON.parse(req.rawBody || "{}");
  next();
}, cinetpayWebhook);

export default router;
