import axios from "axios";
import crypto from "crypto";
import { env } from "../config/env.js";
import { prisma } from "../utils/prisma.js";

export async function initiatePayment(order) {
  const payment = await prisma.payment.create({
    data: { orderId: order.id, transactionId: order.reference, amount: order.totalAmount },
  });

  if (!env.cinetpay.apiKey) {
    // Mode simulé pour développer sans clé API réelle
    return `${env.cinetpay.returnUrl}?simulated=1&ref=${order.reference}`;
  }

  const payload = {
    apikey: env.cinetpay.apiKey,
    site_id: env.cinetpay.siteId,
    transaction_id: payment.transactionId,
    amount: order.totalAmount,
    currency: "XOF",
    description: `Commande ${order.reference} — PB Boutique Hommes`,
    customer_name: order.fullName,
    customer_phone_number: order.phone,
    customer_email: order.email || "client@pbboutique.ci",
    customer_address: order.deliveryAddress,
    customer_city: order.city,
    customer_country: "CI",
    notify_url: env.cinetpay.notifyUrl,
    return_url: env.cinetpay.returnUrl,
    channels: "ALL",
  };

  const { data } = await axios.post(`${env.cinetpay.baseUrl}/payment`, payload, { timeout: 15000 });
  await prisma.payment.update({ where: { id: payment.id }, data: { rawResponse: data } });
  return data?.data?.payment_url || env.cinetpay.returnUrl;
}

export async function verifyTransaction(transactionId) {
  const payload = { apikey: env.cinetpay.apiKey, site_id: env.cinetpay.siteId, transaction_id: transactionId };
  const { data } = await axios.post(`${env.cinetpay.baseUrl}/payment/check`, payload, { timeout: 15000 });
  return data;
}

/**
 * CinetPay signe ses notifications webhook avec un HMAC-SHA256 du token de
 * site + du corps de la requête. Vérifier cette signature empêche quiconque
 * de forger une fausse notification "paiement accepté" sans passer par
 * CinetPay — sans ça, n'importe qui pourrait débloquer des commandes gratuites.
 */
export function isValidCinetPaySignature(rawBody, signatureHeader) {
  if (!env.cinetpay.apiKey || !signatureHeader) return !env.cinetpay.apiKey; // laissé passer en mode simulé
  const computed = crypto.createHmac("sha256", env.cinetpay.apiKey).update(rawBody).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(signatureHeader));
}
