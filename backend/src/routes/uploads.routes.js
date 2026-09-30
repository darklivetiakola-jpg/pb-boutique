import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { v2 as cloudinary } from "cloudinary";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || "uploads");
const ALLOWED = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp" };

// Si CLOUDINARY_URL est défini (cloudinary://clé:secret@nom), les images vont sur Cloudinary
// (persistant, gratuit). Sinon elles sont écrites sur le disque local (dev ou disque Render payant).
const useCloud = Boolean(process.env.CLOUDINARY_URL);
if (!useCloud) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const upload = multer({
  storage: useCloud
    ? multer.memoryStorage()
    : multer.diskStorage({
        destination: UPLOAD_DIR,
        filename: (req, file, cb) => cb(null, crypto.randomUUID() + ALLOWED[file.mimetype]),
      }),
  limits: { fileSize: 5 * 1024 * 1024, files: 8 },
  fileFilter: (req, file, cb) =>
    ALLOWED[file.mimetype] ? cb(null, true) : cb(new Error("Format non supporté (JPG, PNG ou WebP).")),
});

const toCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        { folder: "pb-boutique", resource_type: "image", transformation: [{ width: 1600, crop: "limit", quality: "auto", fetch_format: "auto" }] },
        (err, result) => (err ? reject(err) : resolve(result.secure_url))
      )
      .end(buffer);
  });

const router = Router();

// POST /api/uploads  (champ "files", jusqu'à 8 images de 5 Mo) → { urls: [...] }
router.post("/", requireAuth, requireRole("ADMIN", "STAFF"), upload.array("files", 8), async (req, res, next) => {
  try {
    const files = req.files || [];
    if (useCloud) {
      const urls = await Promise.all(files.map((f) => toCloudinary(f.buffer)));
      return res.status(201).json({ urls });
    }
    const base = `${req.protocol}://${req.get("host")}/uploads`;
    res.status(201).json({ urls: files.map((f) => `${base}/${f.filename}`) });
  } catch (e) { next(e); }
});

export default router;
