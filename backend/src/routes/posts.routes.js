import { Router } from "express";
import { listPosts, getPost, createPost, updatePost, deletePost } from "../controllers/posts.controller.js";
import { requireAuth, requireRole, attachUserIfPresent } from "../middleware/auth.js";

const router = Router();

router.get("/", attachUserIfPresent, listPosts);
router.get("/:slug", getPost);
router.post("/", requireAuth, requireRole("ADMIN", "STAFF"), createPost);
router.patch("/:id", requireAuth, requireRole("ADMIN", "STAFF"), updatePost);
router.delete("/:id", requireAuth, requireRole("ADMIN"), deletePost);

export default router;
