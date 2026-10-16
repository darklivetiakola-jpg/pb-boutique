<template>
  <PromoTicker />
  <SiteHeader />
  <router-view v-slot="{ Component, route }">
    <transition name="page">
      <component :is="Component" :key="route.fullPath" />
    </transition>
  </router-view>
  <SiteFooter />

  <CartDrawer />
  <CheckoutModal v-if="checkout.open" />
  <Toast />
  <BackToTop />
  <MobileTabBar />
  <a href="https://wa.me/2250556650614?text=Bonjour%20PB%20Boutique%2C%20j%27ai%20une%20question"
     class="whatsapp-float" target="_blank" rel="noopener" aria-label="WhatsApp">
    <i class="fa-brands fa-whatsapp"></i>
  </a>
</template>

<script setup>
import { onMounted } from "vue";
import SiteHeader from "./components/SiteHeader.vue";
import SiteFooter from "./components/SiteFooter.vue";
import CartDrawer from "./components/CartDrawer.vue";
import CheckoutModal from "./components/CheckoutModal.vue";
import Toast from "./components/Toast.vue";
import BackToTop from "./components/BackToTop.vue";
import MobileTabBar from "./components/MobileTabBar.vue";
import PromoTicker from "./components/PromoTicker.vue";
import { usePromosStore } from "./stores/promos";
import { useAuthStore } from "./stores/auth";
import { useCheckoutStore } from "./stores/checkout";
import { useProductsStore } from "./stores/products";

const checkout = useCheckoutStore();
const products = useProductsStore();
const promos = usePromosStore();
const auth = useAuthStore();

onMounted(() => {
  const t = localStorage.getItem("pb_theme") === "dark" ? "dark" : "light"; // clair par défaut
  document.documentElement.setAttribute("data-theme", t);
  document.documentElement.style.colorScheme = t;
  products.fetchAll();
  promos.start();
  if (!auth.ready) auth.fetchMe();   // nécessaire pour la cloche de notifications
  // les ventes flash lancées/arrêtées par le propriétaire apparaissent sans recharger la page
  setInterval(() => { if (!document.hidden) products.fetchAll(true); }, 5 * 60 * 1000);
});
</script>

<style>
.page-enter-active { transition: opacity 0.22s ease; }
.page-enter-from { opacity: 0; }
</style>
