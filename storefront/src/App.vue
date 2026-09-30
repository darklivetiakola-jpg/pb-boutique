<template>
  <SiteHeader />
  <router-view v-slot="{ Component, route }">
    <transition name="page" mode="out-in">
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
  document.documentElement.setAttribute("data-theme", localStorage.getItem("pb_boutique_theme") || "light");
  products.fetchAll();
});
</script>

<style>
.page-enter-active, .page-leave-active { transition: opacity 0.2s ease; }
.page-enter-from, .page-leave-to { opacity: 0; }
</style>
