import { Router } from "express";
import rateLimit from "express-rate-limit";
import { register, login, logout, me, googleAuth, changePassword, updateMe } from "../controllers/auth.controller.js";
import { validateBody } from "../middleware/validate.js";
import { registerSchema, loginSchema, changePasswordSchema, updateProfileSchema } from "../validators/auth.validator.js";
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
const passwordLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 8, message: { error: "Trop d'essais, réessayez dans quelques minutes." }, standardHeaders: true, legacyHeaders: false });
router.post("/change-password", requireAuth, passwordLimiter, validateBody(changePasswordSchema), changePassword);
router.get("/me", requireAuth, me);
router.patch("/me", requireAuth, validateBody(updateProfileSchema), updateMe);

export default router;
