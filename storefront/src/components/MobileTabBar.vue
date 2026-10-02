<template>
  <nav v-if="visible" class="ios-tabs" aria-label="Navigation principale">
    <router-link v-for="t in tabs" :key="t.to" :to="t.to" class="ti" :class="{ on: t.on }" :aria-current="t.on ? 'page' : undefined">
      <span class="ic">
        <svg viewBox="0 0 24 24" aria-hidden="true" :class="{ filled: t.on }" stroke-linecap="round" stroke-linejoin="round">
          <template v-if="t.key === 'discover'"><circle cx="12" cy="12" r="9"/><path d="m15.6 8.4-2.1 5.1-5.1 2.1 2.1-5.1 5.1-2.1Z"/></template>
          <template v-else-if="t.key === 'fav'"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"/></template>
          <template v-else-if="t.key === 'cart'"><path d="M5.2 8.2h13.6l-.9 11a1.6 1.6 0 0 1-1.6 1.5H7.7a1.6 1.6 0 0 1-1.6-1.5l-.9-11Z"/><path d="M9 8.2V7a3 3 0 0 1 6 0v1.2"/></template>
          <template v-else><circle cx="12" cy="8.4" r="3.8"/><path d="M4.6 20.2c.7-3.7 3.7-5.9 7.4-5.9s6.700 2.200 7.400 5.900"/></template>
        </svg>
        <b v-if="t.badge" class="bdg">{{ t.badge > 9 ? "9+" : t.badge }}</b>
      </span>
      <span class="lb">{{ t.label }}</span>
    </router-link>
  </nav>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useCartStore } from "../stores/cart";

const route = useRoute(), cart = useCartStore();
// La fiche produit a sa propre barre « Ajouter au panier » : on masque les onglets pour ne pas les superposer.
const visible = computed(() => !route.path.startsWith("/produit"));
const p = computed(() => route.path);
const tabs = computed(() => [
  { key: "discover", to: "/decouvrir", label: "Découvrir", on: p.value === "/" || p.value.startsWith("/decouvrir") || p.value.startsWith("/categorie"), badge: 0 },
  { key: "fav", to: "/favoris", label: "Favoris", on: p.value.startsWith("/favoris"), badge: cart.wishlist.length },
  { key: "cart", to: "/panier", label: "Panier", on: p.value.startsWith("/panier"), badge: cart.itemsCount },
  { key: "me", to: "/compte", label: "Profil", on: p.value.startsWith("/compte"), badge: 0 },
]);
</script>

<style>
/* Barre d'onglets flottante façon iOS : verre dépoli, icônes fines, or à l'état actif. Mobile uniquement. */
.ios-tabs { display: none; }
@media (max-width: 720px) {
  body { padding-bottom: calc(104px + env(safe-area-inset-bottom, 0px)); }
  .ios-tabs {
    display: grid; grid-template-columns: repeat(4, 1fr); align-items: center;
    position: fixed; z-index: 995; left: 14px; right: 14px; max-width: 440px; margin: 0 auto;
    bottom: calc(10px + env(safe-area-inset-bottom, 0px)); height: 68px; padding: 6px;
    border-radius: 34px;
    background: rgba(24, 24, 27, .72);
    -webkit-backdrop-filter: saturate(190%) blur(26px); backdrop-filter: saturate(190%) blur(26px);
    border: 1px solid rgba(255, 255, 255, .09);
    box-shadow: 0 14px 40px rgba(0, 0, 0, .5), inset 0 1px 0 rgba(255, 255, 255, .06);
  }
  [data-theme="light"] .ios-tabs { background: rgba(255, 255, 255, .78); border-color: rgba(0, 0, 0, .07); box-shadow: 0 14px 36px rgba(0, 0, 0, .16); }
  .ios-tabs .ti {
    position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px;
    height: 100%; border-radius: 28px; color: #8E8E93; text-decoration: none; -webkit-tap-highlight-color: transparent;
    transition: color .25s, transform .15s;
  }
  .ios-tabs .ti:active { transform: scale(.9); }
  .ios-tabs .ti::before {
    content: ""; position: absolute; inset: 2px 4px; border-radius: 26px; background: rgba(212, 166, 42, .16);
    opacity: 0; transform: scale(.7); transition: opacity .25s, transform .3s cubic-bezier(.2, .9, .3, 1.3);
  }
  .ios-tabs .ti.on { color: #E6BB4E; }
  .ios-tabs .ti.on::before { opacity: 1; transform: scale(1); }
  .ios-tabs .ic { position: relative; display: grid; place-items: center; z-index: 1; }
  .ios-tabs svg { width: 26px; height: 26px; fill: none; stroke: currentColor; stroke-width: 1.7; transition: fill .25s; }
  .ios-tabs svg.filled { fill: rgba(230, 187, 78, .28); stroke-width: 1.9; }
  .ios-tabs .lb { position: relative; z-index: 1; font-size: .64rem; font-weight: 600; letter-spacing: .01em; }
  .ios-tabs .bdg {
    position: absolute; top: -5px; right: -9px; min-width: 17px; height: 17px; padding: 0 5px; border-radius: 9px;
    background: #D4A62A; color: #111; font-size: .64rem; font-weight: 800; display: grid; place-items: center;
    box-shadow: 0 0 0 2px #18181B; line-height: 1;
  }
  [data-theme="light"] .ios-tabs .bdg { box-shadow: 0 0 0 2px #fff; }
}
</style>
