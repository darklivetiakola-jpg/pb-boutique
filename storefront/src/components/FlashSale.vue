<template>
  <section v-if="live.length" class="fs">
    <div class="container">
      <div class="fs-band">
        <div class="fs-title"><span class="fs-bolt"><i class="fa-solid fa-bolt"></i></span> Ventes Flash</div>
        <div v-if="cd && !cd.done" class="fs-cd"><span>Se termine dans</span>
          <i v-if="cd.d">{{ cd.d }}j</i><i>{{ pad(cd.h) }}</i>:<i>{{ pad(cd.m) }}</i>:<i>{{ pad(cd.s) }}</i>
        </div>
      </div>
      <div class="fs-row">
        <ProductCard v-for="p in live" :key="p.id" :p="p" />
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from "vue";
import ProductCard from "./ProductCard.vue";
import { useProductsStore } from "../stores/products";
import { usePromosStore } from "../stores/promos";
import { useCountdown, pad } from "../utils/countdown";

const products = useProductsStore(), promos = usePromosStore();
const flash = computed(() => products.items.filter((p) => p.flash).sort((a, b) => new Date(a.flashEndsAt) - new Date(b.flashEndsAt)));
const { parts: cd, serverNow } = useCountdown(() => flash.value[0]?.flashEndsAt, () => promos.offset);
// Un produit disparaît de la section dès que SA vente flash est terminée
const live = computed(() => flash.value.filter((p) => new Date(p.flashEndsAt).getTime() > serverNow.value));
</script>

<style>
.fs { padding: 28px 0 8px; }
.fs-band { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 12px 18px; border-radius: 16px 16px 0 0; color: #fff; background: linear-gradient(100deg, #C8102E, #FF5A1F); }
.fs-title { font-weight: 800; font-size: 1.15rem; letter-spacing: .01em; display: flex; align-items: center; gap: 10px; }
.fs-bolt { width: 30px; height: 30px; border-radius: 50%; background: #fff; color: #E5391B; display: grid; place-items: center; font-size: .9rem; }
.fs-cd { display: inline-flex; align-items: center; gap: 4px; font-weight: 700; font-variant-numeric: tabular-nums; } .fs-cd span { font-weight: 500; font-size: .8rem; margin-right: 6px; opacity: .92; }
.fs-cd i { font-style: normal; background: rgba(0,0,0,.28); border-radius: 7px; padding: 3px 7px; }
.fs-row { display: flex; gap: 14px; overflow-x: auto; padding: 16px 14px 18px; background: var(--surface, #fff); border: 1px solid var(--border, #E8E8ED); border-top: 0; border-radius: 0 0 16px 16px; scroll-snap-type: x proximity; scrollbar-width: thin; }
.fs-row > .prod-card { flex: 0 0 190px; scroll-snap-align: start; }
.prod-badge.flash { background: linear-gradient(100deg, #C8102E, #FF5A1F) !important; color: #fff !important; }
@media (max-width: 640px) { .fs-band { padding: 10px 14px; } .fs-title { font-size: 1rem; } .fs-row > .prod-card { flex-basis: 150px; } }
</style>
