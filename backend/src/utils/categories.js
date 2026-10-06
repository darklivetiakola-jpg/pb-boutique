import { prisma } from "./prisma.js";

export const DEFAULT_CATEGORIES = [
  ["Chemises", "chemises"], ["Tee-shirts", "tee-shirts"], ["Polos", "polos"],
  ["Costumes", "costumes"], ["Pantalons", "pantalons"], ["Accessoires", "accessoires"],
];

// Crée les catégories manquantes (sans toucher à celles qui existent).
export async function ensureCategories() {
  for (const [name, slug] of DEFAULT_CATEGORIES) {
    await prisma.category.upsert({ where: { slug }, update: {}, create: { name, slug } });
  }
}
