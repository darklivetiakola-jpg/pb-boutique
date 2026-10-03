<template>
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
  <a href="https://wa.me/2250700000000?text=Bonjour%20PB%20Boutique%2C%20j%27ai%20une%20question"
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
import { useCheckoutStore } from "./stores/checkout";
import { useProductsStore } from "./stores/products";

const checkout = useCheckoutStore();
const products = useProductsStore();

onMounted(() => {
  const t = localStorage.getItem("pb_theme") === "light" ? "light" : "dark"; // sombre par défaut
  document.documentElement.setAttribute("data-theme", t);
  document.documentElement.style.colorScheme = t;
  products.fetchAll();
});
</script>

<style>
.page-enter-active { transition: opacity 0.22s ease; }
.page-enter-from { opacity: 0; }
</style>
