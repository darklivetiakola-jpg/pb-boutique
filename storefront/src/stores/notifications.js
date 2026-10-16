import { defineStore } from "pinia";
import apiClient from "../api/client";
import { useToastStore } from "./toast";

let timer = null;
let seeded = false;
const seen = new Set();

export const useNotificationsStore = defineStore("notifications", {
  state: () => ({ items: [], unread: 0, open: false }),
  actions: {
    async poll() {
      try {
        const { data } = await apiClient.get("/notifications");
        const fresh = data.items.filter((n) => !seen.has(n.id) && !n.readAt);
        data.items.forEach((n) => seen.add(n.id));
        this.items = data.items;
        this.unread = data.unread;
        // Au 1er chargement on n'affiche que le badge ; ensuite chaque nouveauté fait apparaître un message.
        if (seeded && fresh.length) {
          useToastStore().show(fresh.length === 1 ? fresh[0].title : `${fresh.length} nouvelles notifications`);
          if (fresh.some((n) => n.type === "ORDER_STATUS")) window.dispatchEvent(new Event("pb:orders-refresh"));
        }
        seeded = true;
      } catch { /* hors-ligne / non connecté : on réessaiera */ }
    },
    start() {
      this.stop();
      seeded = false; seen.clear();
      this.poll();
      timer = setInterval(() => { if (!document.hidden) this.poll(); }, 20000);
    },
    stop() {
      clearInterval(timer); timer = null;
      this.items = []; this.unread = 0; this.open = false;
    },
    async markAllRead() {
      if (!this.unread) return;
      this.items = this.items.map((n) => ({ ...n, readAt: n.readAt || new Date().toISOString() }));
      this.unread = 0;
      try { await apiClient.post("/notifications/read", { all: true }); } catch { /* ignoré */ }
    },
    async markRead(id) {
      const n = this.items.find((x) => x.id === id);
      if (!n || n.readAt) return;
      n.readAt = new Date().toISOString();
      this.unread = Math.max(0, this.unread - 1);
      try { await apiClient.post("/notifications/read", { ids: [id] }); } catch { /* ignoré */ }
    },
  },
});
