import { defineStore } from "pinia";
import apiClient from "../api/client";

let timer = null;

export const usePromosStore = defineStore("promos", {
  state: () => ({ ticker: [], alert: null, banners: [], offset: 0, ready: false }),
  actions: {
    async fetch() {
      try {
        const { data } = await apiClient.get("/promos/active");
        this.ticker = data.ticker || [];
        this.alert = data.alert || null;
        this.banners = data.banners || [];
        this.offset = new Date(data.serverTime).getTime() - Date.now(); // horloge serveur
      } catch { /* la boutique marche très bien sans promos */ }
      finally { this.ready = true; }
    },
    start() {
      this.fetch();
      clearInterval(timer);
      timer = setInterval(() => { if (!document.hidden) this.fetch(); }, 60000);
    },
  },
});
