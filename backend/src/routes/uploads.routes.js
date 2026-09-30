import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp" };

const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (req, file, cb) => cb(null, crypto.randomUUID() + ALLOWED[file.mimetype]),
  }),
  limits: { fileSize: 5 * 1024 * 1024, files: 8 },
  fileFilter: (req, file, cb) =>
    ALLOWED[file.mimetype] ? cb(null, true) : cb(new Error("Format non supporté (JPG, PNG ou WebP).")),
});

const router = Router();

// POST /api/uploads  (champ "files", jusqu'à 8 images de 5 Mo) → { urls: [...] }
router.post("/", requireAuth, requireRole("ADMIN", "STAFF"), upload.array("files", 8), (req, res) => {
  const base = `${req.protocol}://${req.get("host")}/uploads`;
  res.status(201).json({ urls: (req.files || []).map(f => `${base}/${f.filename}`) });
});

export default router;
