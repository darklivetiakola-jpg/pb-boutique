import { defineStore } from "pinia";
import apiClient from "../api/client";

export const useAuthStore = defineStore("auth", {
  state: () => ({ user: null, ready: false }),
  actions: {
    async fetchMe() {
      try { const { data } = await apiClient.get("/auth/me"); this.user = data; }
      catch { this.user = null; }
      finally { this.ready = true; }
    },
    async login(email, password) {
      const { data } = await apiClient.post("/auth/login", { email, password });
      this.user = data; return data;
    },
    async register(payload) {
      const { data } = await apiClient.post("/auth/register", payload);
      if (!data.needsVerification) this.user = data;   // sinon : il faut d'abord saisir le code reçu par email
      return data;
    },
    async verifyEmail(email, code) {
      const { data } = await apiClient.post("/auth/verify-email", { email, code });
      this.user = data; return data;
    },
    async resendCode(email) {
      const { data } = await apiClient.post("/auth/resend-code", { email });
      return data;
    },
    async loginWithGoogle(credential) {
      const { data } = await apiClient.post("/auth/google", { credential });
      this.user = data; return data;
    },
    async logout() {
      await apiClient.post("/auth/logout");
      this.user = null;
    },
  },
});
