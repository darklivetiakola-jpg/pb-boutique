import { defineStore } from "pinia";

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
  catch { return fallback; }
}

export const useCartStore = defineStore("cart", {
  state: () => ({
    items: load("pb_boutique_cart", []),
    wishlist: load("pb_boutique_wl", []),
    open: false,
  }),
  getters: {
    itemsCount: (s) => s.items.reduce((n, i) => n + i.qty, 0),
    subtotal: (s) => s.items.reduce((n, i) => n + i.price * i.qty, 0),
  },
  actions: {
    persist() {
      localStorage.setItem("pb_boutique_cart", JSON.stringify(this.items));
      localStorage.setItem("pb_boutique_wl", JSON.stringify(this.wishlist));
    },
    add(product, toastFn) {
      const existing = this.items.find(i => i.id === product.id);
      if (existing) existing.qty++;
      else this.items.push({ ...product, qty: 1 });
      this.persist();
      toastFn?.(`"${product.name.substring(0, 32)}…" ajouté`);
    },
    remove(id) { this.items = this.items.filter(i => i.id !== id); this.persist(); },
    changeQty(id, delta) {
      const it = this.items.find(i => i.id === id);
      if (it) { it.qty = Math.max(1, it.qty + delta); this.persist(); }
    },
    clear() { this.items = []; this.persist(); },
    toggleWishlist(id) {
      const idx = this.wishlist.indexOf(id);
      if (idx === -1) this.wishlist.push(id); else this.wishlist.splice(idx, 1);
      this.persist();
    },
    isWished(id) { return this.wishlist.includes(id); },
    openDrawer() { this.open = true; document.body.style.overflow = "hidden"; },
    closeDrawer() { this.open = false; document.body.style.overflow = ""; },
  },
});
