import { defineStore } from "pinia";
import apiClient from "../api/client";

export const useAuthStore = defineStore("auth", {
  state: () => ({ user: null, ready: false }),
  actions: {
    async fetchMe() {
      try {
        const { data } = await apiClient.get("/auth/me");
        this.user = data;
      } catch {
        this.user = null;
      } finally {
        this.ready = true;
      }
    },
    async login(email, password) {
      const { data } = await apiClient.post("/auth/login", { email, password });
      this.user = data;
      return data;
    },
    async logout() {
      await apiClient.post("/auth/logout");
      this.user = null;
    },
  },
});
