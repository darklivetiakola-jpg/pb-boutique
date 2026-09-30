import crypto from "crypto";
import { cookieOptions } from "../config/env.js";
import { prisma } from "../utils/prisma.js";

async function getOrCreateCart(req, res) {
  let sessionKey = req.cookies?.pb_cart_session;
  if (!sessionKey) {
    sessionKey = crypto.randomUUID();
    res.cookie("pb_cart_session", sessionKey, cookieOptions({ maxAge: 30 * 24 * 60 * 60 * 1000 }));
  }
  return prisma.cart.upsert({
    where: { sessionKey },
    update: {},
    create: { sessionKey },
    include: { items: { include: { variant: { include: { product: true } } } } },
  });
}

function serializeCart(cart) {
  const items = cart.items.map(i => ({
    id: i.id,
    variantId: i.variantId,
    productName: i.variant.product.name,
    size: i.variant.size,
    unitPrice: i.variant.product.basePrice,
    quantity: i.quantity,
    subtotal: i.variant.product.basePrice * i.quantity,
  }));
  return {
    id: cart.id,
    items,
    total: items.reduce((s, i) => s + i.subtotal, 0),
    itemsCount: items.reduce((s, i) => s + i.quantity, 0),
  };
}

export async function getCart(req, res) {
  const cart = await getOrCreateCart(req, res);
  res.json(serializeCart(cart));
}

export async function addItem(req, res) {
  const cart = await getOrCreateCart(req, res);
  const { variantId, quantity = 1 } = req.body;

  const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
  if (!variant) return res.status(404).json({ error: "Variante introuvable." });

  await prisma.cartItem.upsert({
    where: { cartId_variantId: { cartId: cart.id, variantId } },
    update: { quantity: { increment: quantity } },
    create: { cartId: cart.id, variantId, quantity },
  });

  const updated = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: { items: { include: { variant: { include: { product: true } } } } },
  });
  res.status(201).json(serializeCart(updated));
}

export async function updateItem(req, res) {
  const cart = await getOrCreateCart(req, res);
  const { itemId, quantity } = req.body;

  if (quantity <= 0) {
    await prisma.cartItem.deleteMany({ where: { id: itemId, cartId: cart.id } });
  } else {
    await prisma.cartItem.updateMany({ where: { id: itemId, cartId: cart.id }, data: { quantity } });
  }

  const updated = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: { items: { include: { variant: { include: { product: true } } } } },
  });
  res.json(serializeCart(updated));
}
