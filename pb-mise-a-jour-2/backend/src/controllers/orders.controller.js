import { ensureVariants } from "../utils/variants.js";
import crypto from "crypto";
import { prisma } from "../utils/prisma.js";
import { initiatePayment, verifyTransaction, isValidCinetPaySignature } from "../services/cinetpay.service.js";
import { FREE_SHIPPING_FROM } from "./delivery.controller.js";
import { notifyOwner, newOrderText, paidText } from "../services/notify.service.js";

function generateReference() {
  return `PB${Date.now().toString(36).toUpperCase()}${crypto.randomUUID().slice(0, 4).toUpperCase()}`;
}

export async function checkout(req, res) {
  const { customer, payment_method, items } = req.body;
  const name = (customer?.name || "").trim();
  const phone = (customer?.phone || "").trim();
  const address = (customer?.address || "").trim();

  if (!name || !phone || !address || !Array.isArray(items) || !items.length) {
    return res.status(422).json({ error: "Informations de commande incomplètes." });
  }

  // Sécurité : on ne fait jamais confiance aux prix envoyés par le client —
  // chaque produit et son prix réel sont relus en base avant de créer la commande.
  const cleanItems = [];
  for (const it of items) {
    const product = await prisma.product.findFirst({
      where: { status: "PUBLISHED", OR: [{ id: String(it.id) }, { slug: String(it.id) }] },
      include: { variants: true },
    });
    if (!product) continue;
    const qty = Math.max(1, Number(it.qty) || 1);
    const variants = product.variants.length ? product.variants : await ensureVariants(product);
    const variant = variants.find(v => v.size === it.size) || variants[0];
    if (!variant) continue;
    cleanItems.push({ product, variant, qty });
  }
  if (!cleanItems.length) return res.status(422).json({ error: "Un article de votre panier n’est plus disponible. Videz le panier puis réessayez." });

  const subtotal = cleanItems.reduce((s, it) => s + it.product.basePrice * it.qty, 0);

  // Livraison : le tarif est TOUJOURS relu en base à partir de la zone choisie (jamais envoyé par le navigateur).
  // S'il n'existe encore aucune zone active, la commande passe comme avant (sans frais de livraison).
  const zones = await prisma.deliveryZone.findMany({ where: { active: true } }).catch(() => []);
  let deliveryFee = 0, zoneName = null;
  if (zones.length) {
    const zone = zones.find((z) => z.id === String(req.body.delivery_zone_id || ""));
    if (!zone) return res.status(422).json({ error: "Choisissez votre zone de livraison." });
    zoneName = zone.name;
    deliveryFee = subtotal >= FREE_SHIPPING_FROM ? 0 : zone.fee;
  }
  const totalAmount = subtotal + deliveryFee;

  const order = await prisma.order.create({
    data: {
      reference: generateReference(),
      userId: req.user?.sub || null,
      fullName: name, phone, deliveryAddress: address,
      city: zoneName || customer?.city || "Abidjan", email: customer?.email || null,
      totalAmount,
      ...(zoneName ? { deliveryFee, deliveryZone: zoneName } : {}),
      items: {
        create: cleanItems.map(it => ({
          variantId: it.variant.id, productId: it.product.id,
          productName: it.product.name, size: it.variant.size,
          unitPrice: it.product.basePrice, quantity: it.qty,
        })),
      },
    },
  });

  // Alerte propriétaire (Telegram) — sans attendre, sans jamais bloquer la commande
  notifyOwner(newOrderText(order, cleanItems.map((it) => `${it.qty} × ${it.product.name} (${it.variant.size})`), zoneName)).catch(() => {});

  const paymentUrl = await initiatePayment(order);

  res.status(201).json({
    ok: true,
    ref: order.reference,
    total: order.totalAmount,
    delivery_fee: order.deliveryFee || 0,
    payment_url: paymentUrl,
    manual_payment: !process.env.CINETPAY_API_KEY,
  });
}

export async function cinetpayWebhook(req, res) {
  const signature = req.headers["x-token"];
  if (!isValidCinetPaySignature(req.rawBody, signature)) {
    return res.status(403).json({ error: "Signature invalide." });
  }

  const transactionId = req.body.cpm_trans_id || req.body.transaction_id;
  if (!transactionId) return res.status(400).json({ error: "transaction_id manquant." });

  const payment = await prisma.payment.findUnique({ where: { transactionId } });
  if (!payment) return res.status(404).json({ error: "Paiement inconnu." });

  const result = await verifyTransaction(transactionId);
  const status = result?.data?.status;

  if (status === "ACCEPTED") {
    await prisma.payment.update({ where: { id: payment.id }, data: { status: "ACCEPTED", rawResponse: result } });
    const paid = await prisma.order.update({ where: { id: payment.orderId }, data: { status: "PAID" } });
    notifyOwner(paidText(paid)).catch(() => {});
  } else if (status === "REFUSED") {
    await prisma.payment.update({ where: { id: payment.id }, data: { status: "REFUSED", rawResponse: result } });
  }

  res.json({ received: true });
}

export async function listOrders(req, res) {
  const isStaff = ["ADMIN", "STAFF"].includes(req.user.role);
  const orders = await prisma.order.findMany({
    where: isStaff ? {} : { userId: req.user.sub },
    include: { items: true, payment: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(orders);
}

/** Résumé léger pour l'admin : nombre en attente + dernière commande reçue (sert aux alertes). */
export async function ordersSummary(req, res) {
  try {
    const [pending, latest] = await Promise.all([
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.findFirst({ orderBy: { createdAt: "desc" }, select: { reference: true, fullName: true, totalAmount: true, createdAt: true } }),
    ]);
    res.json({ pending, latest });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Résumé indisponible." });
  }
}

export async function updateOrderStatus(req, res) {
  const order = await prisma.order.update({
    where: { id: req.params.id },
    data: { status: req.body.status },
  });
  res.json(order);
}
