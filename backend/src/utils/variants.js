import { prisma } from "./prisma.js";

export const DEFAULT_SIZES = ["S", "M", "L", "XL", "XXL"];

/** Crée les tailles par défaut d'un article et les renvoie. Le stock se règle ensuite dans Admin > Stock. */
export async function ensureVariants(product, sizes = DEFAULT_SIZES, stock = 20) {
  const base = String(product.slug || product.id).toUpperCase().replace(/[^A-Z0-9]+/g, "-").slice(0, 30);
  await prisma.productVariant.createMany({
    data: sizes.map((size) => ({
      productId: product.id, size, stock,
      sku: `${base}-${size}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    })),
    skipDuplicates: true,
  });
  return prisma.productVariant.findMany({ where: { productId: product.id } });
}
