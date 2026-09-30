<template>
  <div class="prod-card" @click="goToProduct">
    <div class="prod-card-img">
      <img :src="p.img" :alt="p.name" loading="lazy"/>
      <span v-if="p.badge === 'new'" class="prod-badge new">Nouveau</span>
      <span v-else-if="p.pct >= 25" class="prod-badge sale">−{{ p.pct }}%</span>
      <button class="prod-wl" :class="{ on: cart.isWished(p.id) }" @click.stop="cart.toggleWishlist(p.id)">
        <i class="fa-heart" :class="cart.isWished(p.id) ? 'fa-solid' : 'fa-regular'"></i>
      </button>
    </div>
    <div class="prod-info">
      <div class="prod-name">{{ p.name }}</div>
      <div class="prod-rating">
        <div class="stars">
          <i v-for="s in stars" :key="s.i" class="fa-star" :class="s.cls"></i>
        </div>
        <span class="rcount">{{ p.reviews.toLocaleString("fr-FR") }}</span>
      </div>
      <div class="prod-price">
        <span class="price-main">{{ fmt(p.price) }}</span>
        <span v-if="p.oldPrice" class="price-was">{{ fmt(p.oldPrice) }}</span>
        <span v-if="p.pct" class="price-off">−{{ p.pct }}%</span>
      </div>
      <div class="prod-ship"><i class="fa-solid fa-truck-fast"></i>Livraison Abidjan</div>
    </div>
    <button class="prod-add" @click.stop="addToCart"><i class="fa-solid fa-bag-shopping"></i> Ajouter</button>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useCartStore } from "../stores/cart";
import { useToastStore } from "../stores/toast";

const props = defineProps({ p: { type: Object, required: true } });
const router = useRouter();
const cart = useCartStore();
const toast = useToastStore();

function fmt(n) { return Number(n).toLocaleString("fr-FR") + " FCFA"; }

const stars = computed(() => {
  const r = props.p.rating;
  return Array.from({ length: 5 }, (_, idx) => {
    const i = idx + 1;
    let cls = "fa-regular";
    if (i <= Math.floor(r)) cls = "fa-solid";
    else if (i - r < 1) cls = "fa-solid fa-star-half-stroke";
    return { i, cls };
  });
});

function addToCart() { cart.add(props.p, (msg) => toast.show(msg)); }
function goToProduct() { router.push(`/produit/${props.p.id}`); }
</script>
