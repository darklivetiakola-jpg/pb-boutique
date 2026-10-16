import { defineStore } from "pinia";
import apiClient from "../api/client";

function baseNormalize(r) {
  return {
    id: r.id, name: r.name, cat: r.categorySlug || "",
    price: r.basePrice, oldPrice: r.compareAtPrice,
    img: r.coverImage || r.gallery?.[0] || "",
    gallery: r.gallery, sizes: r.sizes,
    rating: 4.7, reviews: r.reviews ?? 120,
    badge: r.isFeatured ? "new" : null, pct: r.discountPct || 0,
    composition: r.material, care: r.care, description: r.description, desc: r.description,
    stock: r.totalStock,
  };
}

// Vente flash : le prix flash remplace le prix tant qu'elle n'est pas terminée (le serveur re-vérifie à la commande).
function normalizeProduct(r) {
  const p = baseNormalize(r);
  if (r.flashPrice && r.flashEndsAt && r.flashPrice < r.basePrice && new Date(r.flashEndsAt) > new Date()) {
    p.flash = true; p.flashEndsAt = r.flashEndsAt;
    p.oldPrice = r.basePrice; p.price = r.flashPrice;
    p.pct = Math.round((1 - r.flashPrice / r.basePrice) * 100);
  }
  return p;
}

export const useProductsStore = defineStore("products", {
  state: () => ({ items: [], ready: false }),
  actions: {
    async fetchAll(force = false) {
      if (this.ready && !force) return;
      try {
        const { data } = await apiClient.get("/products");
        this.items = Array.isArray(data) ? data.map(normalizeProduct) : [];
      } catch (err) {
        console.error("Impossible de charger les produits :", err);
        this.items = [];
      } finally {
        this.ready = true;
      }
    },
    async fetchOne(id) {
      const { data } = await apiClient.get(`/products/${id}`);
      return normalizeProduct(data);
    },
  },
});
