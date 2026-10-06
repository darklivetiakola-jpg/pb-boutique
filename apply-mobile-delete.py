#!/usr/bin/env python3
"""1) Suppression d'un produit : si le produit figure dans des commandes (ou un panier), il est ARCHIVÉ
      au lieu de provoquer une erreur 500 ; les produits archivés disparaissent de la liste admin.
   2) Page Produits de l'admin : liste en cartes sur mobile, barre du haut empilée.
Usage (racine du projet) : python3 apply-mobile-delete.py — idempotent."""
import sys, pathlib
ROOT = pathlib.Path(__file__).resolve().parent
ok = True

def edit(rel, name, marker, old, new):
    global ok
    p = ROOT / rel; s = p.read_text(encoding="utf8")
    if marker in s: print(f"= déjà fait  {rel} :: {name}"); return
    if old not in s: print(f"✖ ANCRE INTROUVABLE  {rel} :: {name}"); ok = False; return
    p.write_text(s.replace(old, new, 1), encoding="utf8"); print(f"✔ {rel} :: {name}")

C = "backend/src/controllers/products.controller.js"
edit(C, "suppression -> archivage", "ARCHIVED\", isFeatured: false",
"  await prisma.product.delete({ where: { id: req.params.id } });\n  res.status(204).send();",
'''  const { id } = req.params;
  const used = await prisma.orderItem.count({ where: { productId: id } });
  if (!used) {
    try {
      await prisma.product.delete({ where: { id } });
      return res.json({ deleted: true });
    } catch (e) {
      if (e.code === "P2025") return res.status(404).json({ error: "Produit introuvable." });
      // contrainte (ex. article encore dans un panier) : on archive ci-dessous
    }
  }
  await prisma.product.update({ where: { id }, data: { status: "ARCHIVED", isFeatured: false } });
  res.json({ archived: true });''')
edit(C, "masquer les archivés (admin)", 'status: { not: "ARCHIVED" }',
'...(!(isStaff && all) ? { status: "PUBLISHED" } : {}),',
'...(!(isStaff && all) ? { status: "PUBLISHED" } : { status: { not: "ARCHIVED" } }),')

A = "admin/src/views/Products.vue"
edit(A, "barre du haut", "flex-col sm:flex-row",
'    <div class="flex items-center justify-between">\n      <div class="relative w-72">',
'    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">\n      <div class="relative w-full sm:w-72">')
edit(A, "bouton nouveau produit", "gap-2 whitespace-nowrap",
'class="btn-primary flex items-center gap-2"', 'class="btn-primary flex items-center justify-center gap-2 whitespace-nowrap"')
edit(A, "tableau : écrans >= sm", "card overflow-hidden hidden sm:block",
'<div class="card overflow-hidden">\n      <table', '<div class="card overflow-hidden hidden sm:block">\n      <table')
edit(A, "liste mobile", "LISTE MOBILE", "    <!-- MODAL -->", '''    <!-- LISTE MOBILE -->
    <div class="sm:hidden space-y-3">
      <div v-if="loading" class="skeleton h-40 w-full"></div>
      <div v-for="p in filtered" :key="p.id" class="card p-3.5">
        <div class="flex gap-3">
          <div class="w-16 h-16 rounded-xl bg-page overflow-hidden shrink-0 grid place-items-center text-muted">
            <img v-if="p.coverImage" :src="p.coverImage" :alt="p.name" class="w-full h-full object-cover" />
            <Icon v-else name="image" class="w-6 h-6" />
          </div>
          <div class="min-w-0 flex-1">
            <div class="font-semibold leading-snug break-words">{{ p.name }}</div>
            <div class="text-xs mt-0.5" :class="p.category ? 'text-muted' : 'text-warn font-medium'">{{ p.category || "Sans catégorie" }}</div>
            <div class="font-semibold mt-1">{{ fmt(p.basePrice) }} F</div>
          </div>
        </div>
        <div class="flex items-center justify-between mt-3 pt-3 border-t border-line">
          <div class="flex items-center gap-2">
            <span class="badge" :class="p.totalStock === 0 ? 'bg-red-50 text-bad' : p.totalStock < 15 ? 'bg-amber-50 text-warn' : 'bg-green-50 text-good'">Stock {{ p.totalStock }}</span>
            <span class="badge" :class="p.status === 'PUBLISHED' ? 'bg-green-50 text-good' : 'bg-page text-muted'">{{ p.status === 'PUBLISHED' ? 'Publié' : 'Brouillon' }}</span>
          </div>
          <div class="flex items-center">
            <button @click="openEdit(p)" class="p-2.5 rounded-lg text-muted hover:text-ink hover:bg-page" aria-label="Modifier"><Icon name="edit" class="w-5 h-5" /></button>
            <button @click="remove(p)" class="p-2.5 rounded-lg text-muted hover:text-bad hover:bg-page" aria-label="Supprimer"><Icon name="trash" class="w-5 h-5" /></button>
          </div>
        </div>
      </div>
      <div v-if="!loading && !filtered.length" class="text-center text-sm text-muted py-8">Aucun produit.</div>
    </div>

    <!-- MODAL -->''')
edit(A, "message de suppression", "a été archivé",
"  await apiClient.delete(`/products/${p.id}`);\n  load();",
'''  try {
    const { data } = await apiClient.delete(`/products/${p.id}`);
    if (data?.archived) alert("Ce produit figure dans des commandes : il a été archivé (retiré de la boutique) au lieu d'être supprimé.");
  } catch {
    alert("Suppression impossible pour le moment. Réessaie dans un instant.");
  }
  load();''')
print("\n" + ("TERMINÉ ✔" if ok else "TERMINÉ AVEC AVERTISSEMENTS ✖"))
sys.exit(0 if ok else 1)
