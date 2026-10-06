#!/usr/bin/env python3
"""Empêche une erreur dans une route de faire planter tout le serveur (502 Bad Gateway),
et évite l'erreur « slug déjà utilisé » à la création d'un produit.
Usage (racine du projet) : python3 apply-stability.py   — idempotent."""
import sys, json, pathlib
ROOT = pathlib.Path(__file__).resolve().parent
ok = True

def edit(rel, name, marker, old, new, prepend=False, append=False):
    global ok
    p = ROOT / rel; s = p.read_text(encoding="utf8")
    if marker in s: print(f"= déjà fait  {rel} :: {name}"); return
    if prepend: s = new + s
    elif append: s = s.rstrip("\n") + "\n" + new
    elif old in s: s = s.replace(old, new, 1)
    else: print(f"✖ ANCRE INTROUVABLE  {rel} :: {name}"); ok = False; return
    p.write_text(s, encoding="utf8"); print(f"✔ {rel} :: {name}")

# 1) Express 4 ne gère pas les erreurs des routes async : sans ce module, une simple erreur de base
#    de données fait crasher le processus Node => 502 pour tout le monde jusqu'au redémarrage.
edit("backend/package.json", "dépendance", '"express-async-errors"',
     '"express": "^4.19.2",', '"express": "^4.19.2",\n    "express-async-errors": "^3.1.1",')
edit("backend/src/app.js", "import", 'express-async-errors', "", 'import "express-async-errors";\n', prepend=True)

# 2) Slug unique (« Polo » existant => « polo-2 ») au lieu d'une erreur
edit("backend/src/controllers/products.controller.js", "fonction uniqueSlug", "async function uniqueSlug",
     "export async function listProducts",
     'async function uniqueSlug(name) {\n  const base = slugify(name) || "produit";\n  let slug = base, n = 2;\n  while (await prisma.product.findUnique({ where: { slug } })) slug = `${base}-${n++}`;\n  return slug;\n}\n\nexport async function listProducts')
edit("backend/src/controllers/products.controller.js", "création", "slug: await uniqueSlug(name)",
     "slug: slugify(name), categoryId", "slug: await uniqueSlug(name), categoryId")

# 3) Filet de sécurité : on journalise au lieu de tuer le serveur
edit("backend/src/server.js", "garde-fous", "unhandledRejection", "",
     '\nprocess.on("unhandledRejection", (e) => console.error("unhandledRejection:", e));\nprocess.on("uncaughtException", (e) => console.error("uncaughtException:", e));\n', append=True)

json.loads((ROOT / "backend/package.json").read_text(encoding="utf8"))  # JSON toujours valide ?
print("\n" + ("TERMINÉ ✔" if ok else "TERMINÉ AVEC AVERTISSEMENTS ✖"))
sys.exit(0 if ok else 1)
