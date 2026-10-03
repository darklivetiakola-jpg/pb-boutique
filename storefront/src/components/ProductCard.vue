<template>
  <article class="prod-card" role="link" tabindex="0" @click="goToProduct" @keydown.enter="goToProduct">
    <div class="prod-card-img">
      <img :src="p.img" :alt="p.name" loading="lazy" />
      <span v-if="p.badge === 'new'" class="prod-badge new">Nouveau</span>
      <span v-else-if="p.pct >= 25" class="prod-badge sale">−{{ p.pct }}%</span>
      <button class="prod-wl" :class="{ on: cart.isWished(p.id) }" @click.stop="cart.toggleWishlist(p.id)"
        :aria-label="cart.isWished(p.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'" :aria-pressed="cart.isWished(p.id)">
        <i class="fa-heart" :class="cart.isWished(p.id) ? 'fa-solid' : 'fa-regular'"></i>
      </button>
    </div>
    <div class="prod-info">
      <div class="prod-name">{{ p.name }}</div>
      <div class="prod-price">
        <span class="price-main">{{ fmt(p.price) }}</span>
        <span v-if="p.oldPrice" class="price-was">{{ fmt(p.oldPrice) }}</span>
      </div>
    </div>
  </article>
</template>

<script setup>
import { useRouter } from "vue-router";
import { useCartStore } from "../stores/cart";

const props = defineProps({ p: { type: Object, required: true } });
const router = useRouter();
const cart = useCartStore();

const fmt = (n) => Number(n).toLocaleString("fr-FR") + " FCFA";
// Pas d'ajout rapide : la taille se choisit sur la fiche (évite les commandes dans la mauvaise taille)
function goToProduct() { router.push(`/produit/${props.p.id}`); }
</script>
