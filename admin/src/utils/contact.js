// Outils de contact client (WhatsApp, appel, e-mail) — numéros ivoiriens normalisés.
export function normalizePhone(raw, code = "225") {
  let p = String(raw || "").replace(/[\s.\-()]/g, "");
  if (!p) return "";
  if (p.startsWith("+")) return p.slice(1);
  if (p.startsWith("00")) return p.slice(2);
  if (p.startsWith(code) && p.length >= 12) return p;
  return code + p;
}
export const waLink = (phone, text = "") => {
  const n = normalizePhone(phone);
  return n ? `https://wa.me/${n}${text ? `?text=${encodeURIComponent(text)}` : ""}` : "";
};
export const telLink = (phone) => (normalizePhone(phone) ? `tel:+${normalizePhone(phone)}` : "");
export const mailLink = (email, subject = "", body = "") =>
  email ? `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}` : "";

const money = (n) => Math.round(n).toLocaleString("fr-FR") + " FCFA";
const first = (o) => (o.fullName || "").split(" ")[0] || "";

/** Modèles de messages WhatsApp prêts à l'emploi, selon l'étape de la commande. */
export const TEMPLATES = [
  { key: "confirm", label: "Confirmer l’adresse", text: (o) => `Bonjour ${first(o)}, c’est PB Boutique Hommes 👋\nNous avons bien reçu votre commande ${o.reference} (${money(o.totalAmount)}).\nPouvez-vous confirmer votre adresse de livraison : ${o.deliveryAddress}, ${o.city} ?\nMerci !` },
  { key: "pay", label: "Rappel de paiement", text: (o) => `Bonjour ${first(o)}, c’est PB Boutique Hommes.\nLe paiement de votre commande ${o.reference} (${money(o.totalAmount)}) n’est pas encore confirmé. Souhaitez-vous régler par Wave, Orange Money, MTN ou Moov ? Nous vous envoyons le lien dès que vous le souhaitez.` },
  { key: "ship", label: "Commande expédiée", text: (o) => `Bonjour ${first(o)}, bonne nouvelle 🚚\nVotre commande ${o.reference} est en route. Notre livreur vous appellera à l’arrivée. Merci de votre confiance !` },
  { key: "deliv", label: "Livraison aujourd’hui", text: (o) => `Bonjour ${first(o)}, votre commande ${o.reference} sera livrée aujourd’hui. Merci de rester joignable au ${o.phone}.` },
  { key: "thanks", label: "Remerciement", text: (o) => `Bonjour ${first(o)}, merci pour votre achat chez PB Boutique Hommes 🙏\nVotre avis nous aide beaucoup. À très bientôt !` },
];
export function defaultTemplate(o) {
  const map = { PENDING: "pay", PAID: "confirm", PROCESSING: "confirm", SHIPPED: "ship", DELIVERED: "thanks" };
  return TEMPLATES.find((t) => t.key === (map[o.status] || "confirm"));
}
