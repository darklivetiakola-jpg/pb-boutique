import re, pathlib

def rw(p, fn):
    f = pathlib.Path(p)
    if not f.exists():
        print("MANQUANT  ", p); return
    s = f.read_text(); n = fn(s); f.write_text(n)
    print(("modifié    " if n != s else "déjà ok    ") + p)
def write(p, content):
    f = pathlib.Path(p); f.parent.mkdir(parents=True, exist_ok=True); f.write_text(content); print("écrit      " + p)

# CAUSE : un article créé depuis l'admin n'avait AUCUNE taille en base. Au moment de commander, le serveur ne trouvait
# aucune variante, ignorait l'article et répondait « 422 Panier invalide » : impossible d'acheter ces produits.

# 1) Tailles par défaut (S à XXL, 20 en stock) pour tout article qui n'en a pas
write("backend/src/utils/variants.js", '''import { prisma } from "./prisma.js";

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
''')

# 2) Un nouvel article créé depuis l'admin reçoit ses tailles automatiquement
def products(s):
    if "ensureVariants" in s: return s
    s = s.replace("import ", 'import { ensureVariants } from "../utils/variants.js";\nimport ', 1)
    s = s.replace("    include: { images: true, variants: true },\n  });\n  res.status(201).json(product);",
                  "    include: { images: true, variants: true },\n  });\n  if (!product.variants.length) product.variants = await ensureVariants(product);\n  res.status(201).json(product);", 1)
    return s
rw("backend/src/controllers/products.controller.js", products)

# 3) La commande ne rejette plus un article sans taille ; message d'erreur utile si un article a disparu
def orders(s):
    if "ensureVariants" in s: return s
    s = s.replace("import ", 'import { ensureVariants } from "../utils/variants.js";\nimport ', 1)
    s = s.replace("    const variant = product.variants.find(v => v.size === it.size) || product.variants[0];\n    if (!variant) continue;",
                  "    const variants = product.variants.length ? product.variants : await ensureVariants(product);\n    const variant = variants.find(v => v.size === it.size) || variants[0];\n    if (!variant) continue;")
    s = s.replace('return res.status(422).json({ error: "Panier invalide." });',
                  'return res.status(422).json({ error: "Un article de votre panier n’est plus disponible. Videz le panier puis réessayez." });')
    return s
rw("backend/src/controllers/orders.controller.js", orders)

# 4) Au démarrage : les articles déjà créés sans taille sont réparés automatiquement
def server(s):
    if "ensureVariants" in s: return s
    s = s.replace('import { env } from "./config/env.js";', 'import { env } from "./config/env.js";\nimport { prisma } from "./utils/prisma.js";\nimport { ensureVariants } from "./utils/variants.js";', 1)
    s = s.rstrip("\n") + '''

// Auto-réparation : tout article sans tailles (créé depuis l'admin avant ce correctif) en reçoit.
(async () => {
  try {
    const orphans = await prisma.product.findMany({ where: { variants: { none: {} } }, select: { id: true, slug: true } });
    for (const p of orphans) await ensureVariants(p);
    if (orphans.length) console.log(`Tailles par défaut ajoutées à ${orphans.length} article(s).`);
  } catch (e) {
    console.error("Auto-réparation des tailles impossible :", e.message);
  }
})();
'''
    return s
rw("backend/src/server.js", server)

# 5) Photo manquante (ancien fichier perdu) : image de remplacement propre au lieu d'une icône cassée
def main(s):
    if "FALLBACK_IMG" in s: return s
    return s.rstrip("\n") + '''

// Si une photo ne charge pas (ancien fichier supprimé), on affiche une image neutre.
const FALLBACK_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 500'%3E%3Crect width='400' height='500' fill='%23F0F0F0'/%3E%3Ctext x='200' y='255' font-family='Arial' font-size='22' fill='%23999' text-anchor='middle'%3EPhoto bient%C3%B4t%3C/text%3E%3C/svg%3E";
window.addEventListener("error", (e) => {
  const t = e.target;
  if (t && t.tagName === "IMG" && !t.dataset.fb) { t.dataset.fb = "1"; t.src = FALLBACK_IMG; }
}, true);
'''
rw("storefront/src/main.js", main)
