<template>
  <nav v-if="$route.path !== '/panier' && !$route.path.startsWith('/produit')" class="tabbar" aria-label="Navigation">
    <router-link to="/" :class="{ on: $route.path === '/' }"><i class="fa-solid fa-house"></i>Accueil</router-link>
    <router-link to="/categorie/nouveautes" :class="{ on: $route.path.startsWith('/categorie') }"><i class="fa-solid fa-shirt"></i>Boutique</router-link>
    <router-link to="/favoris" :class="{ on: $route.path === '/favoris' }"><i class="fa-regular fa-heart"></i>Favoris<span v-if="cart.wishlist.length" class="cart-count">{{ cart.wishlist.length }}</span></router-link>
    <router-link to="/panier"><IconBag />Panier<span v-if="cart.itemsCount" class="cart-count">{{ cart.itemsCount }}</span></router-link>
    <router-link to="/compte" :class="{ on: $route.path.startsWith('/compte') }"><i class="fa-regular fa-user"></i>Compte</router-link>
  </nav>
</template>

<script setup>
import { useCartStore } from "../stores/cart";
import IconBag from "./IconBag.vue";
const cart = useCartStore();
</script>
