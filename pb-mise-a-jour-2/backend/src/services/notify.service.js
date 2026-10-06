import axios from "axios";

const fmt = (n) => Number(n || 0).toLocaleString("fr-FR") + " FCFA";

/**
 * Envoie un message au propriétaire sur Telegram (gratuit, instantané, fonctionne même
 * quand l'admin est fermé). Inactif tant que TELEGRAM_BOT_TOKEN et TELEGRAM_CHAT_ID
 * ne sont pas définis : ne bloque et ne casse jamais une commande.
 */
export async function notifyOwner(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;
  try {
    await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, { chat_id: chatId, text, disable_web_page_preview: true }, { timeout: 8000 });
  } catch (e) {
    console.error("Notification Telegram impossible :", e.response?.status || e.message);
  }
}

export function newOrderText(order, lines, zoneName) {
  return [
    `🛍️ Nouvelle commande ${order.reference}`,
    `👤 ${order.fullName} — ${order.phone}`,
    `📍 ${zoneName ? zoneName + " — " : ""}${order.deliveryAddress}`,
    ...lines.map((l) => `• ${l}`),
    order.deliveryFee ? `🚚 Livraison : ${fmt(order.deliveryFee)}` : null,
    `💰 Total : ${fmt(order.totalAmount)}`,
  ].filter(Boolean).join("\n");
}

export function paidText(order) {
  return `✅ Paiement reçu — ${order.reference}\n${order.fullName} — ${order.phone}\nMontant : ${fmt(order.totalAmount)}`;
}
