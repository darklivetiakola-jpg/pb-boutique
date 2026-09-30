<template>
  <div class="min-h-screen flex bg-page">
    <!-- Barre latérale (desktop) -->
    <aside class="hidden lg:flex w-64 bg-paper border-r border-line flex-col shrink-0 sticky top-0 h-screen">
      <div class="flex items-center gap-3 px-5 py-5">
        <img src="/logo.png" alt="PB" class="w-10 h-10 rounded-xl" />
        <div>
          <div class="font-bold leading-tight">PB Boutique</div>
          <div class="text-xs text-muted leading-tight">Administration</div>
        </div>
      </div>
      <nav class="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <SideLink v-for="l in links" :key="l.to" v-bind="l" :badge="l.to === '/commandes' ? pendingCount : null" />
      </nav>
      <div class="p-4 border-t border-line flex items-center justify-between">
        <div class="min-w-0">
          <div class="text-sm font-semibold truncate">{{ auth.user?.firstName }} {{ auth.user?.lastName }}</div>
          <div class="text-xs text-muted">{{ auth.user?.role }}</div>
        </div>
        <button @click="handleLogout" class="w-9 h-9 rounded-full bg-page text-muted hover:text-bad grid place-items-center" title="Déconnexion" aria-label="Déconnexion">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>
        </button>
      </div>
    </aside>

    <div class="flex-1 flex flex-col min-w-0">
      <header class="sticky top-0 z-20 h-16 bg-page/80 backdrop-blur-xl flex items-center justify-between px-5 lg:px-8 shrink-0">
        <div>
          <div class="text-xs text-muted">{{ section }}</div>
          <h1 class="text-xl font-bold tracking-tight leading-tight">{{ title }}</h1>
        </div>
        <a href="http://localhost:5500" target="_blank" class="btn-outline !bg-paper border border-line text-sm !py-2">Voir la boutique</a>
      </header>
      <main class="flex-1 px-5 lg:px-8 pb-28 lg:pb-10 pt-2">
        <router-view v-slot="{ Component }">
          <transition name="page" mode="out-in"><component :is="Component" /></transition>
        </router-view>
      </main>
    </div>

    <!-- Barre d'onglets (mobile, façon iOS) -->
    <nav class="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-paper/90 backdrop-blur-xl border-t border-line flex justify-around pt-2 pb-[max(env(safe-area-inset-bottom),8px)]">
      <router-link v-for="l in links.slice(0, 5)" :key="l.to" :to="l.to" custom v-slot="{ isActive, navigate, href }">
        <a :href="href" @click="navigate" class="flex flex-col items-center gap-0.5 text-[11px] font-medium px-2" :class="(l.exact ? $route.path === l.to : isActive) ? 'text-gold' : 'text-muted'">
          <Icon :name="l.icon" class="w-6 h-6" />{{ l.label.split(' ')[0] }}
        </a>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import apiClient from "../api/client";
import SideLink from "./SideLink.vue";
import Icon from "./Icon.vue";

const links = [
  { to: "/", icon: "grid", label: "Tableau de bord", exact: true },
  { to: "/produits", icon: "shirt", label: "Produits" },
  { to: "/stock", icon: "box", label: "Stock" },
  { to: "/commandes", icon: "cart", label: "Commandes" },
  { to: "/clients", icon: "users", label: "Clients" },
  { to: "/paiements", icon: "card", label: "Paiements" },
  { to: "/contenu", icon: "edit", label: "Publications" },
  { to: "/parametres", icon: "settings", label: "Paramètres" },
];

const auth = useAuthStore();
const route = useRoute();
const router = useRouter();
const pendingCount = ref(0);

const titles = {
  dashboard: ["Vue d'ensemble", "Tableau de bord"],
  products: ["Catalogue", "Produits"],
  stock: ["Catalogue", "Gestion du stock"],
  orders: ["Ventes", "Commandes"],
  customers: ["Ventes", "Clients"],
  payments: ["Ventes", "Paiements"],
  posts: ["Marketing", "Contenu & Promotions"],
  settings: ["Compte", "Paramètres"],
};
const section = computed(() => titles[route.name]?.[0] || "");
const title = computed(() => titles[route.name]?.[1] || "");

async function handleLogout() {
  await auth.logout();
  router.push("/login");
}

onMounted(async () => {
  try {
    const { data } = await apiClient.get("/dashboard/stats");
    pendingCount.value = data.pendingOrders || 0;
  } catch { /* silencieux si pas encore de données */ }
});
</script>
