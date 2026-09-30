<template>
  <nav v-if="$route.path !== '/panier'" class="tabbar" aria-label="Navigation">
    <router-link to="/" :class="{ on: $route.path === '/' }"><i class="fa-solid fa-house"></i>Accueil</router-link>
    <router-link to="/categorie/nouveautes" :class="{ on: $route.path.startsWith('/categorie') }"><i class="fa-solid fa-shirt"></i>Boutique</router-link>
    <router-link to="/panier" :class="{ on: $route.path === '/panier' }"><IconBag />Panier<span v-if="cart.itemsCount" class="cart-count">{{ cart.itemsCount }}</span></router-link>
    <router-link to="/compte" :class="{ on: $route.path.startsWith('/compte') }"><i class="fa-solid fa-user"></i>Compte</router-link>
  </nav>
</template>

<script setup>
import { useCartStore } from "../stores/cart";
import IconBag from "./IconBag.vue";
const cart = useCartStore();
</script>
