import { defineStore } from "pinia";
import apiClient from "../api/client";
import { useCartStore } from "./cart";

export const useCheckoutStore = defineStore("checkout", {
  state: () => ({
    open: false,
    submitting: false,
    error: "",
    method: "mobile_money",
    confirmation: null, // { ref, total }
  }),
  actions: {
    openModal() {
      const cart = useCartStore();
      if (!cart.items.length) return false;
      this.open = true; this.error = ""; this.confirmation = null; this.method = "mobile_money";
      return true;
    },
    closeModal() { this.open = false; },

    async submit(form) {
      const cart = useCartStore();
      this.submitting = true; this.error = "";
      try {
        const { data } = await apiClient.post("/orders/checkout", {
          customer: { name: form.name, phone: form.phone, address: form.address },
          payment_method: this.method,
          items: cart.items.map(i => ({ id: i.id, qty: i.qty, size: i.size || undefined })),
        });
        if (data.payment_url && !data.manual_payment) {
          window.location.href = data.payment_url;
          return;
        }
        this.confirmation = { ref: data.ref, total: data.total };
        cart.clear();
      } catch (err) {
        this.error = err.response?.data?.error || "Une erreur est survenue.";
      } finally {
        this.submitting = false;
      }
    },
  },
});
