import { defineStore } from "pinia";
import apiClient from "../api/client";
import { useCartStore } from "./cart";
import { useAuthStore } from "./auth";
import { useToastStore } from "./toast";
import { useDeliveryStore } from "./delivery";

async function goLogin(msg = "Créez un compte ou connectez-vous pour commander.") {
  useToastStore().show(msg);
  const { default: router } = await import("../router");
  router.push({ path: "/compte", query: { redirect: router.currentRoute.value.fullPath } });
}

export const useCheckoutStore = defineStore("checkout", {
  state: () => ({
    open: false,
    submitting: false,
    error: "",
    method: "mobile_money",
    confirmation: null, // { ref, total, fee }
    zoneId: "",
  }),
  actions: {
    openModal() {
      const cart = useCartStore();
      if (!cart.items.length) return false;
      const auth = useAuthStore();
      if (!auth.user) {   // commande réservée aux comptes : on vérifie la session, sinon direction connexion
        (async () => {
          if (!auth.ready) await auth.fetchMe();
          if (auth.user) { this.reset(); }
          else goLogin();
        })();
        return true;
      }
      this.reset();
      return true;
    },
    reset() {
      this.open = true; this.error = ""; this.confirmation = null; this.method = "mobile_money"; this.zoneId = "";
      const delivery = useDeliveryStore();
      delivery.load(true).then(() => {   // zone du profil présélectionnée si elle existe
        const city = (useAuthStore().user?.city || "").trim().toLowerCase();
        const z = delivery.zones.find((x) => x.name.toLowerCase() === city);
        if (z && !this.zoneId) this.zoneId = z.id;
      });
    },
    closeModal() { this.open = false; },

    async submit(form) {
      const cart = useCartStore();
      this.submitting = true; this.error = "";
      try {
        const { data } = await apiClient.post("/orders/checkout", {
          customer: { name: form.name, phone: form.phone, address: form.address, email: useAuthStore().user?.email, city: useAuthStore().user?.city || undefined },
          payment_method: this.method,
          delivery_zone_id: this.zoneId || undefined,
          items: cart.items.map(i => ({ id: i.id, qty: i.qty, size: i.size || undefined })),
        });
        if (data.payment_url && !data.manual_payment) {
          window.location.href = data.payment_url;
          return;
        }
        this.confirmation = { ref: data.ref, total: data.total, fee: data.delivery_fee || 0 };
        cart.clear();
      } catch (err) {
        if (err.response?.status === 401) { this.open = false; goLogin("Votre session a expiré. Reconnectez-vous pour commander."); return; }
        this.error = err.response?.data?.error || "Une erreur est survenue.";
      } finally {
        this.submitting = false;
      }
    },
  },
});
