import { Router } from "express";
import { listZones, listAllZones, createZone, updateZone, deleteZone } from "../controllers/delivery.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();
// Express 4 n'intercepte pas les erreurs des fonctions async : on les transmet au gestionnaire d'erreurs.
const h = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.get("/", h(listZones));                                                        // public (formulaire de commande)
router.get("/all", requireAuth, requireRole("ADMIN", "STAFF"), h(listAllZones));
router.post("/", requireAuth, requireRole("ADMIN"), h(createZone));
router.patch("/:id", requireAuth, requireRole("ADMIN"), h(updateZone));
router.delete("/:id", requireAuth, requireRole("ADMIN"), h(deleteZone));

export default router;
