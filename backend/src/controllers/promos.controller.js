import { prisma } from "../utils/prisma.js";

const KINDS = ["TICKER", "ALERT", "BANNER"];
const str = (v, max = 300) => (v == null || String(v).trim() === "" ? null : String(v).trim().slice(0, max));
const date = (v) => { if (!v) return null; const d = new Date(v); return isNaN(d) ? null : d; };
const color = (v) => (/^#[0-9a-f]{3,8}$/i.test(String(v || "")) ? String(v) : null);

function clean(b, partial = false) {
  const d = {};
  if (!partial || "kind" in b) d.kind = KINDS.includes(b.kind) ? b.kind : "BANNER";
  if (!partial || "title" in b) d.title = str(b.title, 140) || "Sans titre";
  if (!partial || "subtitle" in b) d.subtitle = str(b.subtitle, 200);
  if (!partial || "image" in b) d.image = str(b.image, 600);
  if (!partial || "ctaLabel" in b) d.ctaLabel = str(b.ctaLabel, 40);
  if (!partial || "ctaUrl" in b) d.ctaUrl = str(b.ctaUrl, 400);
  if (!partial || "bgColor" in b) d.bgColor = color(b.bgColor);
  if (!partial || "textColor" in b) d.textColor = color(b.textColor);
  if (!partial || "active" in b) d.active = b.active !== false;
  if (!partial || "startsAt" in b) d.startsAt = date(b.startsAt);
  if (!partial || "endsAt" in b) d.endsAt = date(b.endsAt);
  if (!partial || "position" in b) d.position = Number.isFinite(Number(b.position)) ? Number(b.position) : 0;
  return d;
}

/** Public : ce qui doit s'afficher MAINTENANT sur la boutique. */
export async function listActive(req, res) {
  const now = new Date();
  const promos = await prisma.promo.findMany({
    where: {
      active: true,
      AND: [
        { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
        { OR: [{ endsAt: null }, { endsAt: { gt: now } }] },
      ],
    },
    orderBy: [{ position: "asc" }, { createdAt: "desc" }],
  });
  res.set("Cache-Control", "public, max-age=15");
  res.json({
    serverTime: now.toISOString(),
    ticker: promos.filter((p) => p.kind === "TICKER"),
    alert: promos.find((p) => p.kind === "ALERT") || null,
    banners: promos.filter((p) => p.kind === "BANNER"),
  });
}

export async function listAll(req, res) {
  res.json(await prisma.promo.findMany({ orderBy: [{ kind: "asc" }, { position: "asc" }, { createdAt: "desc" }] }));
}
export async function createPromo(req, res) {
  res.status(201).json(await prisma.promo.create({ data: clean(req.body || {}) }));
}
export async function updatePromo(req, res) {
  res.json(await prisma.promo.update({ where: { id: req.params.id }, data: clean(req.body || {}, true) }));
}
export async function deletePromo(req, res) {
  await prisma.promo.delete({ where: { id: req.params.id } });
  res.status(204).send();
}

// ---------- Ventes flash (prix barré + compte à rebours sur un produit) ----------
export async function listFlash(req, res) {
  const products = await prisma.product.findMany({
    where: { flashPrice: { not: null }, status: { not: "ARCHIVED" } },
    include: { images: { orderBy: { position: "asc" }, take: 1 } },
    orderBy: { flashEndsAt: "asc" },
  });
  res.json(products.map((p) => ({
    id: p.id, name: p.name, basePrice: p.basePrice, flashPrice: p.flashPrice, flashEndsAt: p.flashEndsAt,
    image: p.images[0]?.url || null, live: !!(p.flashEndsAt && p.flashEndsAt > new Date()),
  })));
}

export async function setFlash(req, res) {
  const product = await prisma.product.findUnique({ where: { id: req.params.productId } });
  if (!product) return res.status(404).json({ error: "Produit introuvable." });
  const flashPrice = Math.round(Number(req.body?.flashPrice));
  const endsAt = date(req.body?.flashEndsAt);
  if (!flashPrice || flashPrice <= 0 || flashPrice >= product.basePrice)
    return res.status(422).json({ error: `Le prix flash doit être inférieur au prix actuel (${product.basePrice} F).` });
  if (!endsAt || endsAt <= new Date()) return res.status(422).json({ error: "La date de fin doit être dans le futur." });
  const updated = await prisma.product.update({ where: { id: product.id }, data: { flashPrice, flashEndsAt: endsAt } });
  res.json({ id: updated.id, flashPrice: updated.flashPrice, flashEndsAt: updated.flashEndsAt });
}

export async function clearFlash(req, res) {
  await prisma.product.update({ where: { id: req.params.productId }, data: { flashPrice: null, flashEndsAt: null } });
  res.status(204).send();
}
