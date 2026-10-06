import { defineStore } from "pinia";
import apiClient from "../api/client";

export const useDeliveryStore = defineStore("delivery", {
  state: () => ({ zones: [], freeFrom: 100000, loaded: false }),
  actions: {
    async load(force = false) {
      if (this.loaded && !force) return;
      try {
        const { data } = await apiClient.get("/delivery-zones");
        this.zones = Array.isArray(data?.zones) ? data.zones : [];
        if (data?.freeShippingFrom) this.freeFrom = data.freeShippingFrom;
        this.loaded = true;
      } catch { /* sans zones, la commande fonctionne comme avant */ }
    },
    /** Frais de livraison pour une zone et un sous-total donnés. */
    feeFor(zoneId, subtotal) {
      const z = this.zones.find((x) => x.id === zoneId);
      if (!z) return 0;
      return subtotal >= this.freeFrom ? 0 : z.fee;
    },
  },
});
