import { Router } from "express";
import rateLimit from "express-rate-limit";
import { register, login, logout, me, googleAuth } from "../controllers/auth.controller.js";
import { validateBody } from "../middleware/validate.js";
import { registerSchema, loginSchema } from "../validators/auth.validator.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Anti brute-force sur la connexion : 10 tentatives / 15 min / IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Trop de tentatives, réessayez dans quelques minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/register", validateBody(registerSchema), register);
router.post("/login", loginLimiter, validateBody(loginSchema), login);
router.post("/google", loginLimiter, googleAuth);
router.post("/logout", logout);
router.get("/me", requireAuth, me);

export default router;
