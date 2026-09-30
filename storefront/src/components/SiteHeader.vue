<template>
  <div class="announce">Livraison en 48h à Abidjan · Paiement Mobile Money<router-link to="/categorie/nouveautes">Voir les nouveautés</router-link></div>
  <header class="header">
    <div class="container">
      <div class="header-inner">
        <router-link to="/" class="logo"><img src="/logo.png" alt="PB Boutique Hommes"/></router-link>

        <nav class="main-nav">
          <router-link to="/" exact-active-class="active">Accueil</router-link>
          <router-link
            v-for="c in categories" :key="c.slug"
            :to="`/categorie/${c.slug}`"
            :class="{ active: route.params.slug === c.slug }"
          >{{ c.label }}</router-link>
        </nav>

        <div class="header-actions">
          <div style="position:relative;display:flex;align-items:center;gap:6px;flex:1;max-width:220px;">
            <input
              v-model="search" @keydown.enter="doSearch"
              type="text" placeholder="Rechercher…"
              style="width:100%;padding:6px 12px 6px 30px;border-radius:var(--r-full);border:1px solid var(--border);background:var(--bg2);font-size:0.78rem;font-family:inherit;color:var(--ink);outline:none;"
            />
            <i class="fa-solid fa-magnifying-glass" style="position:absolute;left:10px;font-size:0.72rem;color:var(--ink3);pointer-events:none;"></i>
          </div>

          <button class="hact" title="Thème" @click="toggleTheme">
            <i class="fa-solid" :class="isDark ? 'fa-moon' : 'fa-sun'"></i>
          </button>
          <router-link to="/compte" class="hact" title="Mon compte" style="text-decoration:none;">
            <i class="fa-regular fa-user"></i>
          </router-link>
          <button class="hact" title="Favoris" style="position:relative;">
            <i class="fa-regular fa-heart"></i>
            <span v-if="cart.wishlist.length" class="hact-badge">{{ cart.wishlist.length }}</span>
          </button>
          <router-link to="/panier" class="hact hact-cart" title="Mon panier" aria-label="Mon panier" style="text-decoration:none;position:relative;">
            <IconBag />
            <span v-if="cart.itemsCount" class="cart-count">{{ cart.itemsCount }}</span>
          </router-link>
          <button class="menu-toggle" :class="{ open: menuOpen }" aria-label="Menu" :aria-expanded="menuOpen" @click="menuOpen = !menuOpen"><span></span><span></span><span></span></button>
        </div>
      </div>
    </div>
  </header>
  <nav class="mmenu" :class="{ open: menuOpen }" aria-label="Menu principal" @click="menuOpen = false">
    <router-link v-for="c in categories" :key="c.slug" :to="`/categorie/${c.slug}`">{{ c.label }} <i class="fa-solid fa-chevron-right" style="font-size:.9rem;color:var(--ink3)"></i></router-link>
    <router-link to="/compte">Mon compte <i class="fa-solid fa-chevron-right" style="font-size:.9rem;color:var(--ink3)"></i></router-link>
  </nav>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useCartStore } from "../stores/cart";
import IconBag from "./IconBag.vue";
import { useToastStore } from "../stores/toast";

const route = useRoute();
const router = useRouter();
const cart = useCartStore();
const toast = useToastStore();
const search = ref("");
const isDark = ref(false);
const menuOpen = ref(false);
watch(() => route.fullPath, () => { menuOpen.value = false; });

const categories = [
  { slug: "chemises", label: "Chemises" },
  { slug: "polos", label: "Polos" },
  { slug: "costumes", label: "Costumes" },
  { slug: "pantalons", label: "Pantalons" },
  { slug: "accessoires", label: "Accessoires" },
  { slug: "nouveautes", label: "Nouveautés" },
];

function toggleTheme() {
  const next = isDark.value ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("pb_boutique_theme", next);
  isDark.value = next === "dark";
}

function doSearch() {
  if (search.value.trim()) toast.show(`Recherche : "${search.value.trim()}"`);
}

onMounted(() => {
  isDark.value = document.documentElement.getAttribute("data-theme") === "dark";
});
</script>
