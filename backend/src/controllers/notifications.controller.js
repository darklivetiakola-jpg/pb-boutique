import { prisma } from "../utils/prisma.js";

// Le propriétaire/staff voit les notifications « ADMIN » ; un client ne voit que les siennes.
function scope(req) {
  const isStaff = ["ADMIN", "STAFF"].includes(req.user.role);
  return isStaff ? { audience: "ADMIN" } : { audience: "CUSTOMER", userId: req.user.sub };
}

export async function listMine(req, res) {
  const where = scope(req);
  const [items, unread] = await Promise.all([
    prisma.notification.findMany({ where, orderBy: { createdAt: "desc" }, take: 30 }),
    prisma.notification.count({ where: { ...where, readAt: null } }),
  ]);
  res.set("Cache-Control", "no-store");
  res.json({ items, unread });
}

export async function markRead(req, res) {
  const where = { ...scope(req), readAt: null };
  const { ids, all } = req.body || {};
  if (!all) {
    if (!Array.isArray(ids) || !ids.length) return res.status(422).json({ error: "Aucune notification indiquée." });
    where.id = { in: ids.map(String).slice(0, 100) };
  }
  const r = await prisma.notification.updateMany({ where, data: { readAt: new Date() } });
  res.json({ updated: r.count });
}
