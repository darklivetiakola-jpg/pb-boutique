import { prisma } from "../utils/prisma.js";

function slugify(str) {
  return str.toLowerCase().trim()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function listPosts(req, res) {
  const { type, all } = req.query;
  const isStaff = req.user && ["ADMIN", "STAFF"].includes(req.user.role);
  const where = {
    ...(type ? { type: type.toUpperCase() } : {}),
    ...(!(isStaff && all) ? { status: "PUBLISHED" } : {}),
  };
  const posts = await prisma.post.findMany({ where, orderBy: { createdAt: "desc" } });
  res.json(posts);
}

export async function getPost(req, res) {
  const post = await prisma.post.findUnique({ where: { slug: req.params.slug } });
  if (!post) return res.status(404).json({ error: "Introuvable." });
  res.json(post);
}

export async function createPost(req, res) {
  const { title, type, excerpt, content, coverImage, status, publishAt, discountPct, ctaLabel, ctaUrl } = req.body;
  const post = await prisma.post.create({
    data: {
      title, slug: slugify(title) + "-" + Date.now().toString(36),
      type: type || "ARTICLE", excerpt, content, coverImage,
      status: status || "DRAFT",
      publishAt: publishAt ? new Date(publishAt) : null,
      discountPct: discountPct || null, ctaLabel, ctaUrl,
    },
  });
  res.status(201).json(post);
}

export async function updatePost(req, res) {
  const data = { ...req.body };
  delete data.id; delete data.slug;
  if (data.publishAt) data.publishAt = new Date(data.publishAt);
  const post = await prisma.post.update({ where: { id: req.params.id }, data });
  res.json(post);
}

export async function deletePost(req, res) {
  await prisma.post.delete({ where: { id: req.params.id } });
  res.status(204).send();
}
