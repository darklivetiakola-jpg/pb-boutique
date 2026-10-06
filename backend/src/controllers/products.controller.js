import { ensureVariants } from "../utils/variants.js";
import { prisma } from "../utils/prisma.js";

function slugify(str) {
  return str.toLowerCase().trim()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function listProducts(req, res) {
  const { category, search, all } = req.query;
  const isStaff = req.user && ["ADMIN", "STAFF"].includes(req.user.role);

  const where = {
    ...(category ? { category: { slug: category } } : {}),
    ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
    ...(!(isStaff && all) ? { status: "PUBLISHED" } : {}),
  };

  const products = await prisma.product.findMany({
    where,
    include: { category: true, images: { orderBy: { position: "asc" }, take: 1 }, variants: true },
    orderBy: { createdAt: "desc" },
  });

  res.json(products.map(p => ({
    id: p.id, name: p.name, slug: p.slug,
    category: p.category?.name || null,
    categorySlug: p.category?.slug || null,
    basePrice: p.basePrice, compareAtPrice: p.compareAtPrice,
    discountPct: p.compareAtPrice ? Math.round((1 - p.basePrice / p.compareAtPrice) * 100) : 0,
    isFeatured: p.isFeatured, status: p.status,
    coverImage: p.images[0]?.url || null,
    totalStock: p.variants.reduce((s, v) => s + v.stock, 0),
  })));
}

export async function getProduct(req, res) {
  const key = req.params.slug;
  const product = await prisma.product.findFirst({
    where: { OR: [{ slug: key }, { id: key }] },
    include: { category: true, images: { orderBy: { position: "asc" } }, variants: true },
  });
  if (!product) return res.status(404).json({ error: "Produit introuvable." });

  res.json({
    id: product.id, name: product.name, slug: product.slug,
    category: product.category?.name || null,
    categorySlug: product.category?.slug || null,
    basePrice: product.basePrice, compareAtPrice: product.compareAtPrice,
    discountPct: product.compareAtPrice ? Math.round((1 - product.basePrice / product.compareAtPrice) * 100) : 0,
    status: product.status, isFeatured: product.isFeatured,
    coverImage: product.images[0]?.url || null,
    gallery: product.images.map(i => i.url),
    description: product.description, material: product.material, care: product.care,
    sizes: [...new Set(product.variants.map(v => v.size))],
    totalStock: product.variants.reduce((s, v) => s + v.stock, 0),
    variants: product.variants,
  });
}

export async function createProduct(req, res) {
  const { categorySlug: newSlug } = req.body;
  let catId = req.body.categoryId || null;
  if (newSlug) {
    const cat = await prisma.category.findUnique({ where: { slug: newSlug } });
    if (!cat) return res.status(400).json({ error: "Catégorie inconnue." });
    catId = cat.id;
  }
  const { name, categoryId, description, material, fit, care, origin, basePrice, compareAtPrice, status, isFeatured, images, variants } = req.body;

  const product = await prisma.product.create({
    data: {
      name, slug: slugify(name), categoryId: catId,
      description, material, fit, care, origin,
      basePrice, compareAtPrice: compareAtPrice || null,
      status: status || "DRAFT", isFeatured: !!isFeatured,
      images: images?.length ? { create: images.map((url, i) => ({ url, position: i })) } : undefined,
      variants: variants?.length ? { create: variants } : undefined,
    },
    include: { images: true, variants: true },
  });
  if (!product.variants.length) product.variants = await ensureVariants(product);
  res.status(201).json(product);
}

export async function updateProduct(req, res) {
  const { id } = req.params;
  const { images, categorySlug } = req.body;
  const data = { ...req.body };
  for (const k of ["images", "variants", "id", "gallery", "coverImage", "category", "categorySlug", "discountPct", "totalStock", "createdAt", "updatedAt", "slug"]) delete data[k];
  
  // categorySlug vient de l'admin (ex: "pantalons") -> il faut le convertir
  // en categoryId, la vraie colonne attendue par Prisma.
  if (categorySlug !== undefined) {
    if (categorySlug) {
      const cat = await prisma.category.findUnique({ where: { slug: categorySlug } });
      if (!cat) return res.status(400).json({ error: "Catégorie inconnue." });
      data.categoryId = cat.id;
    } else {
      data.categoryId = null;
    }
  }
  
  // Si "images" (liste d'URL) est envoyé, la galerie est remplacée dans l'ordre reçu
  if (Array.isArray(images)) {
    data.images = { deleteMany: {}, create: images.map((url, i) => ({ url, position: i })) };
  }
  const product = await prisma.product.update({ where: { id }, data, include: { images: true } });
  res.json(product);
}

export async function deleteProduct(req, res) {
  await prisma.product.delete({ where: { id: req.params.id } });
  res.status(204).send();
}

export async function updateStock(req, res) {
  const { variantId } = req.params;
  const { stock } = req.body;
  const variant = await prisma.productVariant.update({
    where: { id: variantId },
    data: { stock: Number(stock) },
  });
  res.json(variant);
}

export async function listCategories(req, res) {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  res.json(categories);
}
