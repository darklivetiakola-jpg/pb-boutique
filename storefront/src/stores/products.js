import { defineStore } from "pinia";
import apiClient from "../api/client";

function normalizeProduct(r) {
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

export const useProductsStore = defineStore("products", {
  state: () => ({ items: [], ready: false }),
  actions: {
    async fetchAll() {
      if (this.ready) return;
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
