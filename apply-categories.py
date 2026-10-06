#!/usr/bin/env python3
"""Ajoute : sélecteur de catégorie dans le formulaire produit (admin) + catégorie « Tee-shirts ».
Usage (depuis la racine du projet) : python3 apply-categories.py
Idempotent : on peut le relancer sans risque. Chaque modification vérifie son point d'ancrage."""
import re, sys, pathlib
ROOT = pathlib.Path(__file__).resolve().parent
ok = True

def patch(rel, edits, create=None):
    global ok
    p = ROOT / rel
    if create and not p.exists():
        p.write_text(create, encoding="utf8"); print(f"+ créé    {rel}"); return
    s = p.read_text(encoding="utf8"); orig = s
    for name, marker, old, new in edits:
        if marker in s:
            print(f"= déjà fait  {rel} :: {name}"); continue
        if old not in s:
            print(f"✖ ANCRE INTROUVABLE  {rel} :: {name}"); ok = False; continue
        s = s.replace(old, new, 1); print(f"✔ {rel} :: {name}")
    if s != orig: p.write_text(s, encoding="utf8")

# ---------- BACKEND ----------
patch("backend/src/utils/categories.js", [], create='''import { prisma } from "./prisma.js";

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
''')

patch("backend/src/server.js", [
  ("import", "ensureCategories", 'import { ensureVariants } from "../utils/variants.js";' if False else 'import { ensureVariants } from "./utils/variants.js";',
   'import { ensureVariants } from "./utils/variants.js";\nimport { ensureCategories } from "./utils/categories.js";'),
  ("appel", "await ensureCategories()", "  try {\n    const orphans",
   "  try {\n    await ensureCategories();\n  } catch (e) {\n    console.error(\"Création des catégories impossible :\", e.message);\n  }\n  try {\n    const orphans"),
])

patch("backend/prisma/seed.js", [
  ("liste", "Tee-shirts", 'const CATEGORIES = ["Chemises", "Polos",', 'const CATEGORIES = ["Chemises", "Tee-shirts", "Polos",'),
])

C = "backend/src/controllers/products.controller.js"
patch(C, [
  ("create: slug -> id", "categorySlug: newSlug",
   "  const { name, categoryId, description,",
   "  const { categorySlug: newSlug } = req.body;\n  let catId = req.body.categoryId || null;\n  if (newSlug) {\n    const cat = await prisma.category.findUnique({ where: { slug: newSlug } });\n    if (!cat) return res.status(400).json({ error: \"Catégorie inconnue.\" });\n    catId = cat.id;\n  }\n  const { name, categoryId, description,"),
  ("create: utilise catId", "categoryId: catId", "categoryId: categoryId || null,", "categoryId: catId,"),
])
# statut dans la liste admin (si la mise à jour 2 est déjà appliquée, c'est déjà fait)
s = (ROOT / C).read_text(encoding="utf8")
if "status: p.status" not in s:
    patch(C, [("liste: statut", "status: p.status",
      "    isFeatured: p.isFeatured,\n    coverImage: p.images[0]?.url || null,",
      "    isFeatured: p.isFeatured, status: p.status,\n    coverImage: p.images[0]?.url || null,"),
    ])
s = (ROOT / C).read_text(encoding="utf8")
if "status: product.status" not in s:
    patch(C, [("détail: statut", "status: product.status",
      "    coverImage: product.images[0]?.url || null,\n    gallery:",
      "    status: product.status, isFeatured: product.isFeatured,\n    coverImage: product.images[0]?.url || null,\n    gallery:"),
    ])

# ---------- ADMIN : formulaire produit ----------
A = "admin/src/views/Products.vue"
s = (ROOT / A).read_text(encoding="utf8")
if "categorySlug" in s and "v-model=\"form.categorySlug\"" in s:
    print(f"= déjà fait  {A}")
elif "form.categoryId" in s:
    print(f"! {A} utilise déjà categoryId (mise à jour 2 appliquée) : rien à faire côté admin.")
else:
    patch(A, [
      ("select catégorie", 'v-model="form.categorySlug"',
       '              <div class="grid grid-cols-2 gap-3">\n                <input v-model.number="form.basePrice"',
       '              <select v-model="form.categorySlug" required class="input">\n                <option value="" disabled>Choisir une catégorie…</option>\n                <option v-for="c in categories" :key="c.id" :value="c.slug">{{ c.name }}</option>\n              </select>\n              <div class="grid grid-cols-2 gap-3">\n                <input v-model.number="form.basePrice"'),
      ("état initial", 'categorySlug: ""; ', 'const form = ref({ name: "",', 'const categories = ref([]);\nconst form = ref({ name: "", categorySlug: "",'),
      ("état à la création", "categorySlug: \"\", basePrice: null, compareAtPrice: null, material: \"\", description: \"\", status: \"DRAFT\", isFeatured: false, images: [] };\n  modalOpen",
       "  form.value = { name: \"\", basePrice: null,",
       "  form.value = { name: \"\", categorySlug: \"\", basePrice: null,"),
      ("édition", "categorySlug: p.categorySlug || \"\"",
       "  form.value = { ...p, images: p.coverImage ? [p.coverImage] : [] };",
       "  form.value = { ...p, categorySlug: p.categorySlug || \"\", status: p.status || \"DRAFT\", images: p.coverImage ? [p.coverImage] : [] };"),
      ("édition: détails", "data.material",
       "    form.value.images = data.gallery || [];",
       "    form.value.images = data.gallery || [];\n    form.value.description = data.description || \"\";\n    form.value.material = data.material || \"\";"),
      ("chargement catégories", "/products/categories",
       "onMounted(load);",
       "async function loadCategories() {\n  try { categories.value = (await apiClient.get(\"/products/categories\")).data; } catch { categories.value = []; }\n}\n\nonMounted(() => { load(); loadCategories(); });"),
    ])

# ---------- BOUTIQUE ----------
patch("storefront/src/components/SiteHeader.vue", [
  ("nav", 'slug: "tee-shirts"', '  { slug: "polos", label: "Polos" },', '  { slug: "polos", label: "Polos" },\n  { slug: "tee-shirts", label: "Tee-shirts" },')])
patch("storefront/src/components/SiteFooter.vue", [
  ("pied de page", "categorie/tee-shirts",
   '                <li><router-link to="/categorie/polos">Polos</router-link></li>',
   '                <li><router-link to="/categorie/polos">Polos</router-link></li>\n                <li><router-link to="/categorie/tee-shirts">Tee-shirts</router-link></li>')])
patch("storefront/src/views/Discover.vue", [
  ("filtre", 'key: "tee-shirts"', '{ key: "polos", label: "Polos" },', '{ key: "polos", label: "Polos" }, { key: "tee-shirts", label: "Tee-shirts" },')])
patch("storefront/src/views/Home.vue", [
  ("carte accueil", 'slug: "tee-shirts"',
   '  { slug: "polos", name: "Polos",',
   '  { slug: "tee-shirts", name: "Tee-shirts", tags: "Coton · Oversize · Basiques", img: img("cat-tee-shirts") },\n  { slug: "polos", name: "Polos",')])
patch("storefront/src/views/Category.vue", [
  ("bandeau", '"tee-shirts": {',
   "\n  polos: {",
   '\n  "tee-shirts": { eyebrow: "Tee-shirts PB", title: "Tee-shirts,<br/><span>Coton &amp; Basiques</span>", sub: "Coupes ajustées ou oversize, coton épais et finitions soignées — la base de toutes les tenues.", heroImg: img("cat-tee-shirts") },\n  polos: {')])
patch("scripts/set-image.mjs", [
  ("slot image", '"cat-tee-shirts"', '  "cat-polos": "Catégorie Polos",', '  "cat-polos": "Catégorie Polos",\n  "cat-tee-shirts": "Catégorie Tee-shirts",')])

print("\n" + ("TERMINÉ ✔" if ok else "TERMINÉ AVEC AVERTISSEMENTS ✖ (voir ci-dessus)"))
sys.exit(0 if ok else 1)
