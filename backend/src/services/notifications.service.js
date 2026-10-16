import { prisma } from "../utils/prisma.js";

const fmt = (n) => Number(n).toLocaleString("fr-FR");

// Une notification ne doit JAMAIS faire échouer une commande : on avale les erreurs.
async function safe(fn) {
  try { return await fn(); } catch (e) { console.error("[notifications]", e.message); }
}

export function notifyAdmins({ type, title, message, orderRef = null, link = "/commandes" }) {
  return safe(() => prisma.notification.create({ data: { audience: "ADMIN", type, title, message, orderRef, link } }));
}

export function notifyCustomer(userId, { type, title, message, orderRef = null, link = "/compte" }) {
  if (!userId) return null;
  return safe(() => prisma.notification.create({ data: { audience: "CUSTOMER", userId, type, title, message, orderRef, link } }));
}

const COPY = {
  PAID: (o) => ["Paiement confirmé ✅", `Nous avons bien reçu le paiement de votre commande ${o.reference}.`],
  PROCESSING: (o) => ["Commande en préparation 🧵", `Votre commande ${o.reference} est en cours de préparation.`],
  SHIPPED: (o) => ["Colis expédié 🚚", `Votre colis ${o.reference} est en route vers ${o.city || "chez vous"}.`],
  DELIVERED: (o) => ["Colis livré 🎉", `Votre commande ${o.reference} a été livrée. Merci pour votre confiance !`],
  CANCELLED: (o) => ["Commande annulée", `Votre commande ${o.reference} a été annulée. Une question ? Écrivez-nous sur WhatsApp.`],
};

/** Nouvelle commande : alerte le propriétaire + accuse réception au client. */
export async function onOrderCreated(order, itemCount) {
  await notifyAdmins({
    type: "ORDER_NEW",
    title: "Nouvelle commande 🛍️",
    message: `${order.fullName} · ${fmt(order.totalAmount)} F · ${itemCount} article${itemCount > 1 ? "s" : ""} · ${order.city}`,
    orderRef: order.reference,
  });
  await notifyCustomer(order.userId, {
    type: "ORDER_STATUS",
    title: "Commande reçue 📦",
    message: `Merci ! Votre commande ${order.reference} (${fmt(order.totalAmount)} F) est bien enregistrée.`,
    orderRef: order.reference,
  });
}

/** Changement d'état : prévient le client (et le propriétaire si le paiement vient d'arriver). */
export async function onOrderStatusChanged(order, { fromWebhook = false } = {}) {
  const copy = COPY[order.status];
  if (copy) {
    const [title, message] = copy(order);
    await notifyCustomer(order.userId, { type: "ORDER_STATUS", title, message, orderRef: order.reference });
  }
  if (fromWebhook && order.status === "PAID") {
    await notifyAdmins({
      type: "ORDER_PAID",
      title: "Paiement reçu 💰",
      message: `${order.fullName} a payé ${fmt(order.totalAmount)} F (${order.reference})`,
      orderRef: order.reference,
    });
  }
}
