import { app } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./utils/prisma.js";
import { ensureVariants } from "./utils/variants.js";
import { ensureCategories } from "./utils/categories.js";

app.listen(env.port, () => {
  console.log(`PB Boutique Hommes API — http://localhost:${env.port}`);
});

// Auto-réparation : tout article sans tailles (créé depuis l'admin avant ce correctif) en reçoit.
(async () => {
  try {
    await ensureCategories();
  } catch (e) {
    console.error("Création des catégories impossible :", e.message);
  }
  try {
    const orphans = await prisma.product.findMany({ where: { variants: { none: {} } }, select: { id: true, slug: true } });
    for (const p of orphans) await ensureVariants(p);
    if (orphans.length) console.log(`Tailles par défaut ajoutées à ${orphans.length} article(s).`);
  } catch (e) {
    console.error("Auto-réparation des tailles impossible :", e.message);
  }
})();

process.on("unhandledRejection", (e) => console.error("unhandledRejection:", e));
process.on("uncaughtException", (e) => console.error("uncaughtException:", e));
