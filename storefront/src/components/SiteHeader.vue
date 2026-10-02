<template>
  <div class="announce">Livraison en 48h à Abidjan · Paiement Mobile Money<router-link to="/categorie/nouveautes">Voir les nouveautés</router-link></div>
  <header class="header">
    <div class="container">
      <div class="header-inner">
        <router-link to="/" class="logo" aria-label="PB Boutique Hommes — accueil"><img src="/logo.png" alt="PB Boutique Hommes"/></router-link>

        <nav class="main-nav" aria-label="Catégories">
          <router-link to="/" exact-active-class="active">Accueil</router-link>
          <router-link v-for="c in categories" :key="c.slug" :to="`/categorie/${c.slug}`" :class="{ active: route.params.slug === c.slug }">{{ c.label }}</router-link>
        </nav>

        <div class="header-actions">
          <label class="hsearch">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input v-model="search" @keydown.enter="doSearch" type="search" placeholder="Rechercher…" enterkeyhint="search" aria-label="Rechercher un produit" />
          </label>
          <router-link to="/compte" class="hact hact-user" aria-label="Mon compte"><i class="fa-regular fa-user"></i></router-link>
          <router-link to="/favoris" class="hact" aria-label="Mes favoris">
            <i class="fa-regular fa-heart"></i>
            <span v-if="cart.wishlist.length" class="hact-badge">{{ cart.wishlist.length }}</span>
          </router-link>
          <router-link to="/panier" class="hact hact-cart" aria-label="Mon panier">
            <IconBag />
            <span v-if="cart.itemsCount" class="cart-count">{{ cart.itemsCount }}</span>
          </router-link>
          <router-link to="/decouvrir" class="hact hact-search" aria-label="Rechercher">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
          </router-link>
          <button class="menu-toggle" :class="{ open: menuOpen }" aria-label="Menu" :aria-expanded="menuOpen" @click="menuOpen = !menuOpen"><span></span><span></span><span></span></button>
        </div>
      </div>
    </div>
  </header>

  <nav class="mmenu" :class="{ open: menuOpen }" aria-label="Menu principal">
    <label class="hsearch hsearch-m">
      <i class="fa-solid fa-magnifying-glass"></i>
      <input v-model="search" @keydown.enter="doSearch" type="search" placeholder="Rechercher un produit" enterkeyhint="search" />
    </label>
    <router-link v-for="c in categories" :key="c.slug" :to="`/categorie/${c.slug}`" @click="menuOpen = false">{{ c.label }}<i class="fa-solid fa-chevron-right"></i></router-link>
    <router-link to="/favoris" @click="menuOpen = false">Mes favoris<i class="fa-solid fa-chevron-right"></i></router-link>
    <router-link to="/compte" @click="menuOpen = false">Mon compte<i class="fa-solid fa-chevron-right"></i></router-link>
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
const menuOpen = ref(false);
watch(() => route.fullPath, () => { menuOpen.value = false; });
watch(menuOpen, (v) => { document.body.style.overflow = v ? "hidden" : ""; });

const categories = [
  { slug: "chemises", label: "Chemises" },
  { slug: "polos", label: "Polos" },
  { slug: "costumes", label: "Costumes" },
  { slug: "pantalons", label: "Pantalons" },
  { slug: "accessoires", label: "Accessoires" },
  { slug: "nouveautes", label: "Nouveautés" },
];


function doSearch() {
  const v = search.value.trim();
  if (!v) return;
  router.push({ path: "/decouvrir", query: { q: v } });
  search.value = "";
  menuOpen.value = false;
}

onMounted(() => {
});
</script>
