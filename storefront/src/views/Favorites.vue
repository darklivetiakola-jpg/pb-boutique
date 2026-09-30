<template>
  <main class="fav container">
    <div class="fav-head">
      <h1>Mes favoris</h1>
      <span v-if="items.length" class="fav-count">{{ items.length }} article{{ items.length > 1 ? "s" : "" }}</span>
    </div>
    <div v-if="!products.ready" class="fav-empty"><p>Chargement…</p></div>
    <div v-else-if="!items.length" class="fav-empty">
      <div class="fav-empty-ic"><i class="fa-regular fa-heart"></i></div>
      <h2>Aucun favori pour l'instant</h2>
      <p>Touchez le cœur sur un article pour le retrouver ici.</p>
      <router-link to="/categorie/nouveautes" class="btn btn-primary btn-lg">Découvrir la collection</router-link>
    </div>
    <div v-else class="prod-grid"><ProductCard v-for="p in items" :key="p.id" :p="p" /></div>
  </main>
</template>

<script setup>
import { computed, onMounted } from "vue";
import ProductCard from "../components/ProductCard.vue";
import { useProductsStore } from "../stores/products";
import { useCartStore } from "../stores/cart";
const products = useProductsStore(), cart = useCartStore();
const items = computed(() => products.items.filter(p => cart.wishlist.includes(p.id)));
onMounted(() => products.fetchAll());
</script>
