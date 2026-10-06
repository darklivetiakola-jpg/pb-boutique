<template>
  <div class="min-h-app flex bg-page">
    <!-- Barre latérale (ordinateur) -->
    <aside class="hidden lg:flex w-64 bg-paper border-r border-line flex-col shrink-0 sticky top-0 h-screen">
      <div class="flex items-center gap-3 px-5 py-5">
        <img :src="logo" alt="PB" class="w-10 h-10 rounded-xl object-cover" />
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
        <button @click="handleLogout" class="icon-btn" title="Déconnexion" aria-label="Déconnexion">
          <Icon name="logout" class="w-[18px] h-[18px]" />
        </button>
      </div>
    </aside>

    <div class="flex-1 flex flex-col min-w-0">
      <header class="sticky top-0 z-20 bg-page/85 backdrop-blur-xl pt-[env(safe-area-inset-top)]">
        <div class="h-14 lg:h-16 flex items-center justify-between gap-3 px-4 lg:px-8">
          <div class="flex items-center gap-3 min-w-0">
            <img :src="logo" alt="PB" class="lg:hidden w-9 h-9 rounded-lg object-cover shrink-0" />
            <div class="min-w-0">
              <div class="hidden lg:block text-xs text-muted">{{ section }}</div>
              <h1 class="text-lg lg:text-xl font-bold tracking-tight leading-tight truncate">{{ title }}</h1>
            </div>
          </div>
          <a href="/" target="_blank" rel="noopener" class="btn-outline !bg-paper border border-line text-sm !py-2 !px-3 sm:!px-4 flex items-center gap-2 shrink-0" aria-label="Voir la boutique">
            <Icon name="store" class="w-[18px] h-[18px]" /><span class="hidden sm:inline">Voir la boutique</span>
          </a>
        </div>
      </header>
      <main class="flex-1 px-4 lg:px-8 pb-[calc(88px+env(safe-area-inset-bottom))] lg:pb-10 pt-2">
        <router-view v-slot="{ Component }">
          <transition name="page" mode="out-in"><component :is="Component" /></transition>
        </router-view>
      </main>
    </div>

    <!-- Barre d'onglets (téléphone) : 4 raccourcis + « Plus » -->
    <nav class="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-paper/95 backdrop-blur-xl border-t border-line grid grid-cols-5 pt-1.5 pb-[max(env(safe-area-inset-bottom),6px)]" aria-label="Navigation principale">
      <router-link v-for="l in tabs" :key="l.to" :to="l.to" custom v-slot="{ isActive, navigate, href }">
        <a :href="href" @click="navigate" class="relative flex flex-col items-center justify-center gap-0.5 min-h-[52px] text-[11px] font-medium"
          :class="(l.exact ? $route.path === l.to : isActive) ? 'text-gold' : 'text-muted'">
          <span class="relative">
            <Icon :name="l.icon" class="w-6 h-6" />
            <span v-if="l.to === '/commandes' && pendingCount" class="absolute -top-1.5 -right-2.5 bg-bad text-white text-[10px] font-bold rounded-full min-w-[17px] h-[17px] px-1 grid place-items-center">{{ pendingCount > 99 ? "99+" : pendingCount }}</span>
          </span>
          {{ l.short }}
        </a>
      </router-link>
      <button type="button" @click="moreOpen = true" class="flex flex-col items-center justify-center gap-0.5 min-h-[52px] text-[11px] font-medium" :class="inMore ? 'text-gold' : 'text-muted'" aria-haspopup="dialog">
        <Icon name="more" class="w-6 h-6" />Plus
      </button>
    </nav>

    <Toaster />

    <!-- Feuille « Plus » -->
    <Transition name="more">
      <div v-if="moreOpen" class="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-[3px] flex items-end" @click.self="moreOpen = false">
        <div class="more-panel w-full bg-paper rounded-t-3xl shadow-pop pt-2 pb-[max(env(safe-area-inset-bottom),16px)]" role="dialog" aria-modal="true" aria-label="Autres sections">
          <div class="mx-auto w-10 h-1 rounded-full bg-line mb-3"></div>
          <div class="px-5 pb-2 flex items-center gap-3">
            <div class="w-11 h-11 rounded-full bg-gold-soft text-gold grid place-items-center font-bold">{{ initials }}</div>
            <div class="min-w-0">
              <div class="font-semibold truncate">{{ auth.user?.firstName }} {{ auth.user?.lastName }}</div>
              <div class="text-xs text-muted truncate">{{ auth.user?.email }}</div>
            </div>
          </div>
          <div class="px-3 pt-1">
            <router-link v-for="l in moreLinks" :key="l.to" :to="l.to" class="flex items-center gap-3 px-3 min-h-[52px] rounded-2xl text-[16px] font-medium active:bg-page" @click="moreOpen = false">
              <span class="w-9 h-9 rounded-xl bg-page grid place-items-center text-ink"><Icon :name="l.icon" class="w-5 h-5" /></span>
              {{ l.label }}
              <Icon name="chevron" class="w-4 h-4 ml-auto text-muted" />
            </router-link>
            <a href="/" target="_blank" rel="noopener" class="flex items-center gap-3 px-3 min-h-[52px] rounded-2xl text-[16px] font-medium active:bg-page">
              <span class="w-9 h-9 rounded-xl bg-page grid place-items-center text-ink"><Icon name="store" class="w-5 h-5" /></span>
              Voir la boutique
              <Icon name="chevron" class="w-4 h-4 ml-auto text-muted" />
            </a>
            <button type="button" @click="handleLogout" class="w-full flex items-center gap-3 px-3 min-h-[52px] rounded-2xl text-[16px] font-medium text-bad active:bg-red-50">
              <span class="w-9 h-9 rounded-xl bg-red-50 grid place-items-center"><Icon name="logout" class="w-5 h-5" /></span>
              Se déconnecter
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import apiClient from "../api/client";
import SideLink from "./SideLink.vue";
import Icon from "./Icon.vue";
import Toaster from "./Toaster.vue";
import { say } from "../utils/toast";
import { playBeep, vibrate, showNotification } from "../utils/alerts";
const logo = import.meta.env.BASE_URL + "icon-192.png";

const links = [
  { to: "/", icon: "grid", label: "Tableau de bord", short: "Accueil", exact: true },
  { to: "/commandes", icon: "cart", label: "Commandes", short: "Commandes" },
  { to: "/produits", icon: "shirt", label: "Produits", short: "Produits" },
  { to: "/stock", icon: "box", label: "Stock", short: "Stock" },
  { to: "/clients", icon: "users", label: "Clients", short: "Clients" },
  { to: "/livraison", icon: "truck", label: "Zones de livraison", short: "Livraison" },
  { to: "/paiements", icon: "card", label: "Paiements", short: "Paiements" },
  { to: "/contenu", icon: "edit", label: "Publications", short: "Contenu" },
  { to: "/parametres", icon: "settings", label: "Paramètres", short: "Réglages" },
];
const TAB_KEYS = ["/", "/commandes", "/produits", "/stock"];
const tabs = links.filter((l) => TAB_KEYS.includes(l.to));
const moreLinks = links.filter((l) => !TAB_KEYS.includes(l.to));

const auth = useAuthStore();
const route = useRoute();
const router = useRouter();
const pendingCount = ref(0);
const moreOpen = ref(false);
let timer;

const titles = {
  dashboard: ["Vue d'ensemble", "Tableau de bord"],
  products: ["Catalogue", "Produits"],
  stock: ["Catalogue", "Gestion du stock"],
  orders: ["Ventes", "Commandes"],
  customers: ["Ventes", "Clients"],
  delivery: ["Boutique", "Zones de livraison"],
  payments: ["Ventes", "Paiements"],
  posts: ["Marketing", "Contenu & promotions"],
  settings: ["Compte", "Paramètres"],
};
const section = computed(() => titles[route.name]?.[0] || "");
const title = computed(() => titles[route.name]?.[1] || "");
const inMore = computed(() => moreLinks.some((l) => route.path.startsWith(l.to)));
const initials = computed(() => ((auth.user?.firstName?.[0] || "") + (auth.user?.lastName?.[0] || "")).toUpperCase() || "A");

let lastRef = null; // dernière commande déjà connue : sert à détecter les nouvelles
async function loadPending() {
  try {
    const { data } = await apiClient.get("/orders/summary");
    pendingCount.value = data.pending || 0;
    const ref = data.latest?.reference || "";
    if (lastRef !== null && ref && ref !== lastRef) {
      const o = data.latest;
      say(`🔔 Nouvelle commande : ${o.fullName} · ${Math.round(o.totalAmount).toLocaleString("fr-FR")} F`);
      playBeep(); vibrate();
      if (document.hidden) showNotification("Nouvelle commande PB Boutique", `${o.fullName} — ${Math.round(o.totalAmount).toLocaleString("fr-FR")} F`, logo);
    }
    lastRef = ref;
  } catch { /* silencieux */ }
}

async function handleLogout() {
  moreOpen.value = false;
  await auth.logout();
  router.push("/login");
}

const onKey = (e) => { if (e.key === "Escape") moreOpen.value = false; };
const onVisible = () => { if (!document.hidden) loadPending(); };

watch(() => route.fullPath, (to, from) => {
  moreOpen.value = false;
  // Évite de recharger les stats à chaque page : seulement autour de la page Commandes
  if (to.startsWith("/commandes") || from?.startsWith("/commandes")) loadPending();
});
const baseTitle = document.title;
watch(pendingCount, (n) => { document.title = n ? `(${n}) ${baseTitle}` : baseTitle; });
watch(moreOpen, (v) => { document.body.style.overflow = v ? "hidden" : ""; });

onMounted(() => { loadPending(); timer = setInterval(loadPending, 30000); window.addEventListener("keydown", onKey); document.addEventListener("visibilitychange", onVisible); });
onBeforeUnmount(() => { clearInterval(timer); window.removeEventListener("keydown", onKey); document.removeEventListener("visibilitychange", onVisible); document.body.style.overflow = ""; });
</script>

<style scoped>
.more-enter-active, .more-leave-active { transition: opacity .22s; }
.more-enter-active .more-panel, .more-leave-active .more-panel { transition: transform .3s cubic-bezier(.2,.8,.2,1); }
.more-enter-from, .more-leave-to { opacity: 0; }
.more-enter-from .more-panel, .more-leave-to .more-panel { transform: translateY(100%); }
</style>
