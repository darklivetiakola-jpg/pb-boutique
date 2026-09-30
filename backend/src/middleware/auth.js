import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

/**
 * Vérifie le token d'accès (envoyé en cookie httpOnly, jamais en localStorage
 * côté client — ça évite le vol de token par une faille XSS).
 */
export function requireAuth(req, res, next) {
  const token = req.cookies?.pb_access_token;
  if (!token) return res.status(401).json({ error: "Non authentifié." });

  try {
    req.user = jwt.verify(token, env.jwt.accessSecret);
    next();
  } catch {
    return res.status(401).json({ error: "Session expirée, reconnectez-vous." });
  }
}

/** Autorise seulement certains rôles (ex: requireRole("ADMIN","STAFF")) */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Accès refusé." });
    }
    next();
  };
}

/** Optionnel : attache req.user si présent, sans bloquer la requête */
export function attachUserIfPresent(req, res, next) {
  const token = req.cookies?.pb_access_token;
  if (token) {
    try {
      req.user = jwt.verify(token, env.jwt.accessSecret);
    } catch {
      /* token invalide -> on ignore, la route publique reste accessible */
    }
  }
  next();
}
