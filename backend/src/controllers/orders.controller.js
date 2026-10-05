import { ensureVariants } from "../utils/variants.js";
import crypto from "crypto";
import { prisma } from "../utils/prisma.js";
import { initiatePayment, verifyTransaction, isValidCinetPaySignature } from "../services/cinetpay.service.js";

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
      where: { OR: [{ id: String(it.id) }, { slug: String(it.id) }] },
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

  const totalAmount = cleanItems.reduce((s, it) => s + it.product.basePrice * it.qty, 0);

  const order = await prisma.order.create({
    data: {
      reference: generateReference(),
      userId: req.user?.sub || null,
      fullName: name, phone, deliveryAddress: address,
      city: customer?.city || "Abidjan", email: customer?.email || null,
      totalAmount,
      items: {
        create: cleanItems.map(it => ({
          variantId: it.variant.id, productId: it.product.id,
          productName: it.product.name, size: it.variant.size,
          unitPrice: it.product.basePrice, quantity: it.qty,
        })),
      },
    },
  });

  const paymentUrl = await initiatePayment(order);

  res.status(201).json({
    ok: true,
    ref: order.reference,
    total: order.totalAmount,
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
    await prisma.order.update({ where: { id: payment.orderId }, data: { status: "PAID" } });
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

export async function updateOrderStatus(req, res) {
  const order = await prisma.order.update({
    where: { id: req.params.id },
    data: { status: req.body.status },
  });
  res.json(order);
}
