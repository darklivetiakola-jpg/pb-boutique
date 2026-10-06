import { prisma } from "../utils/prisma.js";

/** Montant (FCFA) à partir duquel la livraison est offerte. Modifiable via la variable FREE_SHIPPING_FROM. */
export const FREE_SHIPPING_FROM = Number(process.env.FREE_SHIPPING_FROM || 100000);

const order = [{ position: "asc" }, { name: "asc" }];

function clean(body, partial = false) {
  const out = {};
  if (!partial || body.name !== undefined) {
    const name = String(body.name || "").trim().replace(/\s+/g, " ");
    if (name.length < 2 || name.length > 60) return { error: "Donnez un nom de zone (2 à 60 caractères)." };
    out.name = name;
  }
  if (!partial || body.fee !== undefined) {
    const fee = Math.round(Number(body.fee));
    if (!Number.isFinite(fee) || fee < 0 || fee > 100000) return { error: "Le tarif doit être compris entre 0 et 100 000 FCFA." };
    out.fee = fee;
  }
  if (body.active !== undefined) out.active = !!body.active;
  return { data: out };
}

/** Public : zones actives, pour le formulaire de commande. */
export async function listZones(req, res) {
  const zones = await prisma.deliveryZone.findMany({ where: { active: true }, orderBy: order, select: { id: true, name: true, fee: true } });
  res.json({ zones, freeShippingFrom: FREE_SHIPPING_FROM });
}

/** Admin : toutes les zones (actives ou non). */
export async function listAllZones(req, res) {
  res.json(await prisma.deliveryZone.findMany({ orderBy: order }));
}

export async function createZone(req, res) {
  const { data, error } = clean(req.body);
  if (error) return res.status(422).json({ error });
  const last = await prisma.deliveryZone.aggregate({ _max: { position: true } });
  try {
    const zone = await prisma.deliveryZone.create({ data: { ...data, position: (last._max.position ?? -1) + 1 } });
    res.status(201).json(zone);
  } catch (e) {
    if (e.code === "P2002") return res.status(409).json({ error: "Cette zone existe déjà." });
    throw e;
  }
}

export async function updateZone(req, res) {
  const { data, error } = clean(req.body, true);
  if (error) return res.status(422).json({ error });
  try {
    res.json(await prisma.deliveryZone.update({ where: { id: req.params.id }, data }));
  } catch (e) {
    if (e.code === "P2002") return res.status(409).json({ error: "Cette zone existe déjà." });
    if (e.code === "P2025") return res.status(404).json({ error: "Zone introuvable." });
    throw e;
  }
}

export async function deleteZone(req, res) {
  try {
    await prisma.deliveryZone.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (e) {
    if (e.code === "P2025") return res.status(404).json({ error: "Zone introuvable." });
    throw e;
  }
}
